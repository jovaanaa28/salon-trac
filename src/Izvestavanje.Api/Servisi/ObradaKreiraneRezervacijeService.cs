using Izvestavanje.Api.Entiteti;
using Izvestavanje.Api.Podaci;
using Microsoft.EntityFrameworkCore;
using Zajednicko.Poruke.Dogadjaji;

namespace Izvestavanje.Api.Servisi;

public class ObradaKreiraneRezervacijeService
{
    private readonly IzvestavanjeKontekst _kontekst;
    private readonly IdempotencijaDogadjajaService _idempotencija;

    public ObradaKreiraneRezervacijeService(
        IzvestavanjeKontekst kontekst,
        IdempotencijaDogadjajaService idempotencija)
    {
        _kontekst = kontekst;
        _idempotencija = idempotencija;
    }

    public async Task ObradiAsync(
        RezervacijaKreiranaDogadjaj dogadjaj,
        CancellationToken cancellationToken)
    {
        if (dogadjaj.DogadjajId == Guid.Empty)
        {
            throw new ArgumentException(
                "DogadjajId ne sme biti prazan.");
        }

        if (dogadjaj.RezervacijaId <= 0)
        {
            throw new ArgumentException(
                "RezervacijaId nije validan.");
        }

        if (string.IsNullOrWhiteSpace(dogadjaj.Status))
        {
            throw new ArgumentException(
                "Status rezervacije nije zadat.");
        }

        if (dogadjaj.Stavke == null ||
            dogadjaj.Stavke.Count == 0)
        {
            throw new ArgumentException(
                "Rezervacija mora imati najmanje jednu stavku.");
        }

        var rezervacijaVecPostoji =
            await _kontekst.Rezervacije
                .AsNoTracking()
                .AnyAsync(
                    r => r.RezervacijaIdA1 ==
                         dogadjaj.RezervacijaId,
                    cancellationToken);

        if (rezervacijaVecPostoji)
        {
            throw new InvalidOperationException(
                $"Rezervacija A1 ID {dogadjaj.RezervacijaId} " +
                "vec postoji u A2 bazi.");
        }

        var rezervacija =
            new IzvestajnaRezervacija
            {
                RezervacijaIdA1 =
                    dogadjaj.RezervacijaId,

                DatumKreiranja =
                    dogadjaj.DatumKreiranja,

                Status =
                    dogadjaj.Status,

                Stavke = dogadjaj.Stavke
                    .Select(stavka =>
                        new IzvestajnaStavkaRezervacije
                        {
                            UslugaId =
                                stavka.UslugaId,

                            KategorijaUslugeId =
                                stavka.KategorijaUslugeId,

                            NazivKategorije =
                                stavka.NazivKategorije,

                            Datum =
                                stavka.Datum,

                            VremePocetka =
                                stavka.VremePocetka
                        })
                    .ToList()
            };

        _kontekst.Rezervacije.Add(rezervacija);

        _idempotencija.EvidentirajObradjenDogadjaj(
            dogadjaj.DogadjajId,
            "rezervacija.kreirana");

        await _kontekst.SaveChangesAsync(
            cancellationToken);
    }
}