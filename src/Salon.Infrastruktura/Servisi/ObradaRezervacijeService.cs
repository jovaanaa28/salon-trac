using Microsoft.EntityFrameworkCore;
using Salon.Domen.Entiteti;
using Salon.Domen.Enumeracije;
using Salon.Infrastruktura.Podaci;
using Zajednicko.Poruke.Komande;

namespace Salon.Infrastruktura.Servisi;

public class ObradaRezervacijeService
{
    private readonly SalonKontekst _kontekst;
    private readonly ObracunCeneService _obracunCeneService;
    private readonly GeneratorKodovaService _generatorKodovaService;
    private readonly KursService _kursService;

    public ObradaRezervacijeService(
        SalonKontekst kontekst,
        ObracunCeneService obracunCeneService,
        GeneratorKodovaService generatorKodovaService,
        KursService kursService)
    {
        _kontekst = kontekst;
        _obracunCeneService = obracunCeneService;
        _generatorKodovaService = generatorKodovaService;
        _kursService = kursService;
    }

    // Provera i cuvanje rezervacije preuzete iz RabbitMQ-a
    public async Task ObradiAsync(
        KreirajRezervacijuKomanda komanda,
        CancellationToken cancellationToken)
    {
        if (komanda.Stavke == null || komanda.Stavke.Count == 0)
        {
            throw new ArgumentException(
                "Rezervacija mora imati najmanje jednu uslugu.");
        }

        if (string.IsNullOrWhiteSpace(komanda.Ime) ||
            string.IsNullOrWhiteSpace(komanda.Prezime) ||
            string.IsNullOrWhiteSpace(komanda.Email))
        {
            throw new ArgumentException(
                "Nedostaju obavezni podaci korisnika.");
        }

        var valuta = komanda.IzabranaValuta
            .Trim()
            .ToUpperInvariant();

        // Provera dozvoljene valute
        var valutaDozvoljena = await _kontekst.DozvoljeneValute
            .AsNoTracking()
            .AnyAsync(
                v => v.Oznaka == valuta,
                cancellationToken);

        if (!valutaDozvoljena)
        {
            throw new ArgumentException(
                "Izabrana valuta nije dozvoljena.");
        }

        // Ucitavanje usluga iz baze
        var idsUsluga = komanda.Stavke
            .Select(s => s.UslugaId)
            .Distinct()
            .ToList();

        var usluge = await _kontekst.Usluge
            .Where(u => idsUsluga.Contains(u.Id))
            .ToDictionaryAsync(
                u => u.Id,
                cancellationToken);

        if (usluge.Count != idsUsluga.Count)
        {
            throw new ArgumentException(
                "Jedna ili vise izabranih usluga ne postoji.");
        }

        // Grupisanje zbog provere kapaciteta
        var grupe = komanda.Stavke.GroupBy(s => new
        {
            s.UslugaId,
            Datum = s.Datum.Date,
            s.VremePocetka
        });

        foreach (var grupa in grupe)
        {
            var usluga = usluge[grupa.Key.UslugaId];

            // Provera da je izabrano vreme stvarni termin usluge
            if (!ValidanTermin(
                usluga,
                grupa.Key.VremePocetka))
            {
                throw new ArgumentException(
                    $"Termin za uslugu '{usluga.Naziv}' nije validan.");
            }

            var pocetakDana = grupa.Key.Datum;
            var krajDana = pocetakDana.AddDays(1);

            // Ponovna provera kapaciteta neposredno pre upisa
            var zauzeto = await _kontekst.StavkeRezervacija
                .AsNoTracking()
                .CountAsync(s =>
                    s.UslugaId == grupa.Key.UslugaId &&
                    s.Datum >= pocetakDana &&
                    s.Datum < krajDana &&
                    s.VremePocetka == grupa.Key.VremePocetka &&
                    s.Rezervacija.Status ==
                        StatusRezervacije.AKTIVNA,
                    cancellationToken);

            var trazeniBrojMesta = grupa.Count();

            if (zauzeto + trazeniBrojMesta >
                usluga.MaksimalanBrojKlijenataPoTerminu)
            {
                throw new ArgumentException(
                    $"Nema dovoljno mesta za uslugu '{usluga.Naziv}'.");
            }
        }

        // Cena se uzima iz baze, nikada iz zahteva klijenta
        var ukupnaCenaRsd = komanda.Stavke.Sum(
            s => usluge[s.UslugaId].Cena);

        // Obracun 10% i eventualnog promo popusta 5%
        var obracun = await _obracunCeneService.IzracunajAsync(
            ukupnaCenaRsd,
            komanda.PromoKod);

        // Kurs u trenutku konacnog obracuna
        var kurs = await _kursService.VratiKursIzRsdAsync(
            valuta);

        var ukupnaCenaValuta = Math.Round(
            ukupnaCenaRsd * kurs,
            2,
            MidpointRounding.AwayFromZero);

        var konacnaCenaValuta = Math.Round(
            obracun.KonacnaCenaRsd * kurs,
            2,
            MidpointRounding.AwayFromZero);

        // Generisanje pristupne sifre i novog promo-koda
        var sifra = await _generatorKodovaService
            .GenerisiSifruRezervacijeAsync();

        var noviPromoKod = await _generatorKodovaService
            .GenerisiPromoKodAsync();

        await using var transakcija =
            await _kontekst.Database.BeginTransactionAsync(
                cancellationToken);

        try
        {
            var rezervacija = new Rezervacija
            {
                Ime = komanda.Ime.Trim(),
                Prezime = komanda.Prezime.Trim(),
                Adresa = komanda.Adresa.Trim(),
                PostanskiBroj = komanda.PostanskiBroj.Trim(),
                Mesto = komanda.Mesto.Trim(),
                Drzava = komanda.Drzava.Trim(),
                Email = komanda.Email.Trim(),

                Sifra = sifra,
                Status = StatusRezervacije.AKTIVNA,

                IzabranaValuta = valuta,
                UkupnaCena = ukupnaCenaValuta,
                Popust = obracun.ProcenatPopusta,
                KonacnaCena = konacnaCenaValuta,
                Kurs = kurs,

                DatumKreiranja = DateTime.UtcNow
            };

            _kontekst.Rezervacije.Add(rezervacija);

            // Cuvanje svih izabranih usluga
            foreach (var stavkaKomande in komanda.Stavke)
            {
                var usluga = usluge[stavkaKomande.UslugaId];

                _kontekst.StavkeRezervacija.Add(
                    new StavkaRezervacije
                    {
                        Rezervacija = rezervacija,
                        UslugaId = usluga.Id,
                        Datum = stavkaKomande.Datum.Date,
                        VremePocetka =
                            stavkaKomande.VremePocetka,

                        // Pamti se cena usluge u trenutku rezervacije
                        Cena = usluga.Cena
                    });
            }

            // Ako je promo kod iskoriscen, menja mu se status
            if (obracun.PromoKodVazi &&
                !string.IsNullOrWhiteSpace(komanda.PromoKod))
            {
                var kod = komanda.PromoKod
                    .Trim()
                    .ToUpperInvariant();

                var iskorisceniPromo =
                    await _kontekst.PromoKodovi
                        .FirstOrDefaultAsync(
                            p =>
                                p.Kod == kod &&
                                p.Status ==
                                    StatusPromoKoda.DOSTUPAN,
                            cancellationToken);

                if (iskorisceniPromo == null)
                {
                    throw new ArgumentException(
                        "Promo kod vise nije dostupan.");
                }

                iskorisceniPromo.Status =
                    StatusPromoKoda.ISKORISCEN;

                iskorisceniPromo.DatumKoriscenja =
                    DateTime.UtcNow;
            }

            // Svaka uspesna rezervacija dobija novi promo kod
            _kontekst.PromoKodovi.Add(new PromoKod
            {
                Kod = noviPromoKod,
                Rezervacija = rezervacija,
                Status = StatusPromoKoda.DOSTUPAN
            });

            // Tek ovde rezervacija stvarno ulazi u bazu
            await _kontekst.SaveChangesAsync(
                cancellationToken);

            await transakcija.CommitAsync(
                cancellationToken);
        }
        catch
        {
            await transakcija.RollbackAsync(
                cancellationToken);

            throw;
        }
    }

    private static bool ValidanTermin(
        Usluga usluga,
        TimeSpan vremePocetka)
    {
        if (usluga.TrajanjeUMinutima <= 0)
        {
            return false;
        }

        var trajanje =
            TimeSpan.FromMinutes(usluga.TrajanjeUMinutima);

        if (vremePocetka <
            usluga.VremePocetkaPrvogTermina)
        {
            return false;
        }

        if (vremePocetka + trajanje >
            usluga.VremeZavrsetkaPoslednjegTermina)
        {
            return false;
        }

        var razlika =
            vremePocetka -
            usluga.VremePocetkaPrvogTermina;

        return razlika.Ticks % trajanje.Ticks == 0;
    }
}