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
            throw new InvalidOperationException(
                "Rezervacija za dogadjaj nije pronadjena.");

        var stavke = await _kontekst.StavkeRezervacija
            .AsNoTracking()
            .Where(s => s.RezervacijaId == rezervacijaId)
            .Select(s => new StavkaRezervacijeDogadjaj
            {
                UslugaId = s.UslugaId,
                Datum = s.Datum,
                VremePocetka = s.VremePocetka,
                CenaRsd = s.Cena
            })
            .ToListAsync(cancellationToken);

        var dogadjaj = new RezervacijaKreiranaDogadjaj
        {
            RezervacijaId = rezervacija.Id,
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
}