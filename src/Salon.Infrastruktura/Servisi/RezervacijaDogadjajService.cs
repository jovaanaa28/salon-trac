using Microsoft.EntityFrameworkCore;
using Salon.Infrastruktura.Podaci;
using Zajednicko.Poruke.Dogadjaji;

namespace Salon.Infrastruktura.Servisi;

public class RezervacijaDogadjajService
{
    private readonly SalonKontekst _kontekst;
    private readonly RabbitMqDogadjajPublisherService _publisher;

    public RezervacijaDogadjajService(
        SalonKontekst kontekst,
        RabbitMqDogadjajPublisherService publisher)
    {
        _kontekst = kontekst;
        _publisher = publisher;
    }

    public async Task PosaljiIzmenjenaAsync(
        int rezervacijaId,
        string vrstaIzmene,
        CancellationToken cancellationToken)
    {
        var rezervacija = await _kontekst.Rezervacije
            .AsNoTracking()
            .FirstOrDefaultAsync(
                r => r.Id == rezervacijaId,
                cancellationToken);

        if (rezervacija == null)
        {
            throw new InvalidOperationException(
                "Rezervacija za dogadjaj nije pronadjena.");
        }

        var stavke = await UcitajStavkeAsync(
            rezervacijaId,
            cancellationToken);

        var dogadjaj = new RezervacijaIzmenjenaDogadjaj
        {
            RezervacijaId = rezervacija.Id,
            VrstaIzmene = vrstaIzmene,
            Email = rezervacija.Email,
            Status = rezervacija.Status.ToString(),
            IzabranaValuta = rezervacija.IzabranaValuta,
            UkupnaCena = rezervacija.UkupnaCena,
            Popust = rezervacija.Popust,
            KonacnaCena = rezervacija.KonacnaCena,
            Stavke = stavke
        };

        await _publisher.PosaljiAsync(
            dogadjaj,
            "rezervacija.izmenjena",
            cancellationToken);
    }

    public async Task PosaljiKreiranaAsync(
        int rezervacijaId,
        CancellationToken cancellationToken)
    {
        var rezervacija = await _kontekst.Rezervacije
            .AsNoTracking()
            .FirstOrDefaultAsync(
                r => r.Id == rezervacijaId,
                cancellationToken);

        if (rezervacija == null)
        {
            throw new InvalidOperationException(
                "Rezervacija za dogadjaj nije pronadjena.");
        }

        var stavke = await UcitajStavkeAsync(
            rezervacijaId,
            cancellationToken);

        var dogadjaj = new RezervacijaKreiranaDogadjaj
        {
            RezervacijaId = rezervacija.Id,
            DatumKreiranja = rezervacija.DatumKreiranja,
            Email = rezervacija.Email,
            Status = rezervacija.Status.ToString(),
            IzabranaValuta = rezervacija.IzabranaValuta,
            UkupnaCena = rezervacija.UkupnaCena,
            Popust = rezervacija.Popust,
            KonacnaCena = rezervacija.KonacnaCena,
            Stavke = stavke
        };

        await _publisher.PosaljiAsync(
            dogadjaj,
            "rezervacija.kreirana",
            cancellationToken);
    }

    public async Task PosaljiOtkazanaAsync(

    int rezervacijaId,

    CancellationToken cancellationToken)

    {

        var rezervacija = await _kontekst.Rezervacije

            .AsNoTracking()

            .FirstOrDefaultAsync(

                r => r.Id == rezervacijaId,

                cancellationToken);



        if (rezervacija == null)

        {

            throw new InvalidOperationException(

                "Rezervacija za dogadjaj nije pronadjena.");

        }



        if (!rezervacija.DatumOtkazivanja.HasValue)

        {

            throw new InvalidOperationException(

                "Rezervacija nije otkazana.");

        }



        var dogadjaj = new RezervacijaOtkazanaDogadjaj

        {

            RezervacijaId = rezervacija.Id,

            Email = rezervacija.Email,

            Status = rezervacija.Status.ToString(),

            DatumOtkazivanja = rezervacija.DatumOtkazivanja.Value

        };



        await _publisher.PosaljiAsync(

            dogadjaj,

            "rezervacija.otkazana",

            cancellationToken);

    }

    private async Task<List<StavkaRezervacijeDogadjaj>> UcitajStavkeAsync(
        int rezervacijaId,
        CancellationToken cancellationToken)
    {
        return await _kontekst.StavkeRezervacija
            .AsNoTracking()
            .Where(s => s.RezervacijaId == rezervacijaId)
            .Select(s => new StavkaRezervacijeDogadjaj
            {
                UslugaId = s.UslugaId,
                KategorijaUslugeId = s.Usluga.KategorijaUslugeId,
                NazivKategorije = s.Usluga.KategorijaUsluge.Naziv,
                Datum = s.Datum,
                VremePocetka = s.VremePocetka,
                CenaRsd = s.Cena
            })
            .ToListAsync(cancellationToken);
    }
}