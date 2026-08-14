using Microsoft.EntityFrameworkCore;
using Salon.Domen.Entiteti;
using Salon.Domen.Enumeracije;
using Salon.Infrastruktura.Podaci;

namespace Salon.Infrastruktura.Servisi;

public class UpravljanjeRezervacijomService
{
    private readonly SalonKontekst _kontekst;
    private readonly KursService _kursService;

    public UpravljanjeRezervacijomService(
        SalonKontekst kontekst,
        KursService kursService)
    {
        _kontekst = kontekst;
        _kursService = kursService;
    }

    // pomocna provera pristupa

    private async Task<Rezervacija> PronadjiRezervacijuAsync(
        int rezervacijaId,
        string email,
        string sifra,
        CancellationToken cancellationToken)
    {
        var emailNormalized = email.Trim();
        var sifraNormalized = sifra.Trim().ToUpperInvariant();

        var rezervacija = await _kontekst.Rezervacije
            .FirstOrDefaultAsync(r =>
                r.Id == rezervacijaId &&
                r.Email.ToLower() == emailNormalized.ToLower() &&
                r.Sifra == sifraNormalized,
                cancellationToken);

        if (rezervacija == null)
            throw new ArgumentException("Rezervacija nije pronadjena.");

        return rezervacija;
    }

    //Validacija konkretnog vremena termina
    private static bool ValidanTermin(Usluga usluga, TimeSpan vremePocetka)
    {
        if (usluga.TrajanjeUMinutima <= 0)
            return false;

        var trajanje = TimeSpan.FromMinutes(usluga.TrajanjeUMinutima);

        if (vremePocetka < usluga.VremePocetkaPrvogTermina)
            return false;

        if (vremePocetka + trajanje > usluga.VremeZavrsetkaPoslednjegTermina)
            return false;

        var razlika = vremePocetka - usluga.VremePocetkaPrvogTermina;
        return razlika.Ticks % trajanje.Ticks == 0;
    }

    //Preracun postojece rezervacije
    private async Task PreracunajCenuAsync(
        Rezervacija rezervacija,
        CancellationToken cancellationToken)
    {
        var ukupnoRsd = await _kontekst.StavkeRezervacija
            .Where(s => s.RezervacijaId == rezervacija.Id)
            .SumAsync(s => s.Cena, cancellationToken);

        var iznosPopustaRsd = Math.Round(
            ukupnoRsd * rezervacija.Popust / 100m,
            2,
            MidpointRounding.AwayFromZero);

        var konacnoRsd = ukupnoRsd - iznosPopustaRsd;

        var kurs = await _kursService.VratiKursIzRsdAsync(
            rezervacija.IzabranaValuta);

        rezervacija.UkupnaCena = Math.Round(
            ukupnoRsd * kurs, 2, MidpointRounding.AwayFromZero);

        rezervacija.KonacnaCena = Math.Round(
            konacnoRsd * kurs, 2, MidpointRounding.AwayFromZero);

        rezervacija.Kurs = kurs;
        // rezervacija.Popust se NE menja. 
    }

    // Dodavanje nove stavke u postojeću rezervaciju
    public async Task DodajStavkuAsync(
        int rezervacijaId,
        string email,
        string sifra,
        int uslugaId,
        DateTime datum,
        TimeSpan vremePocetka,
        CancellationToken cancellationToken)
    {
        var rezervacija = await PronadjiRezervacijuAsync(
            rezervacijaId, email, sifra, cancellationToken);

        if (rezervacija.Status != StatusRezervacije.AKTIVNA)
            throw new ArgumentException("Otkazana rezervacija ne moze da se menja.");

        var usluga = await _kontekst.Usluge
            .FirstOrDefaultAsync(u => u.Id == uslugaId, cancellationToken);

        if (usluga == null)
            throw new ArgumentException("Usluga nije pronadjena.");

        if (datum == default || !ValidanTermin(usluga, vremePocetka))
            throw new ArgumentException("Izabrani termin nije validan.");

        var dan = datum.Date;
        var sutra = dan.AddDays(1);

        await using var transakcija = await _kontekst.Database
            .BeginTransactionAsync(cancellationToken);

        try
        {
            var zauzeto = await _kontekst.StavkeRezervacija
                .AsNoTracking()
                .CountAsync(s =>
                    s.UslugaId == usluga.Id &&
                    s.Datum >= dan && s.Datum < sutra &&
                    s.VremePocetka == vremePocetka &&
                    s.Rezervacija.Status == StatusRezervacije.AKTIVNA,
                    cancellationToken);

            if (zauzeto >= usluga.MaksimalanBrojKlijenataPoTerminu)
                throw new ArgumentException("Izabrani termin je popunjen.");

            _kontekst.StavkeRezervacija.Add(new StavkaRezervacije
            {
                RezervacijaId = rezervacija.Id,
                UslugaId = usluga.Id,
                Datum = dan,
                VremePocetka = vremePocetka,
                Cena = usluga.Cena
            });

            await _kontekst.SaveChangesAsync(cancellationToken);
            await PreracunajCenuAsync(rezervacija, cancellationToken);
            await _kontekst.SaveChangesAsync(cancellationToken);

            await transakcija.CommitAsync(cancellationToken);
        }
        catch
        {
            await transakcija.RollbackAsync(cancellationToken);
            throw;
        }
    }

    // Brisanje stavke iz postojeće rezervacije
    public async Task ObrisiStavkuAsync(
        int rezervacijaId,
        int stavkaId,
        string email,
        string sifra,
        CancellationToken cancellationToken)
    {
        var rezervacija = await PronadjiRezervacijuAsync(
            rezervacijaId, email, sifra, cancellationToken);

        if (rezervacija.Status != StatusRezervacije.AKTIVNA)
            throw new ArgumentException("Otkazana rezervacija ne moze da se menja.");

        var stavka = await _kontekst.StavkeRezervacija
            .FirstOrDefaultAsync(s =>
                s.Id == stavkaId && s.RezervacijaId == rezervacija.Id,
                cancellationToken);

        if (stavka == null)
            throw new ArgumentException("Stavka nije pronadjena.");

        var brojStavki = await _kontekst.StavkeRezervacija
            .CountAsync(s => s.RezervacijaId == rezervacija.Id, cancellationToken);

        if (brojStavki <= 1)
            throw new ArgumentException(
                "Poslednja usluga se ne uklanja. Otkazite celu rezervaciju.");

        await using var transakcija = await _kontekst.Database
            .BeginTransactionAsync(cancellationToken);

        try
        {
            _kontekst.StavkeRezervacija.Remove(stavka);
            await _kontekst.SaveChangesAsync(cancellationToken);

            await PreracunajCenuAsync(rezervacija, cancellationToken);
            await _kontekst.SaveChangesAsync(cancellationToken);

            await transakcija.CommitAsync(cancellationToken);
        }
        catch
        {
            await transakcija.RollbackAsync(cancellationToken);
            throw;
        }
    }
}