using Izvestavanje.Api.Entiteti;
using Izvestavanje.Api.Podaci;
using Microsoft.EntityFrameworkCore;
using Zajednicko.Poruke.Dogadjaji;

namespace Izvestavanje.Api.Servisi;

public class ObradaIzmenjeneRezervacijeService
{
    private readonly IzvestavanjeKontekst _kontekst;
    private readonly IdempotencijaDogadjajaService _idempotencija;

    public ObradaIzmenjeneRezervacijeService(
        IzvestavanjeKontekst kontekst,
        IdempotencijaDogadjajaService idempotencija)
    {
        _kontekst = kontekst;
        _idempotencija = idempotencija;
    }

    public async Task ObradiAsync(
        RezervacijaIzmenjenaDogadjaj dogadjaj,
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

        var rezervacija =
            await _kontekst.Rezervacije
                .Include(r => r.Stavke)
                .FirstOrDefaultAsync(
                    r => r.RezervacijaIdA1 ==
                         dogadjaj.RezervacijaId,
                    cancellationToken);

        if (rezervacija == null)
        {
            throw new InvalidOperationException(
                $"Rezervacija A1 ID {dogadjaj.RezervacijaId} " +
                "ne postoji u A2 bazi.");
        }

        // DatumKreiranja se NAMERNO ne menja.
        // On predstavlja originalni datum nastanka rezervacije.
        rezervacija.Status = dogadjaj.Status;

        var stareStavke =
            rezervacija.Stavke.ToList();

        _kontekst.StavkeRezervacija
            .RemoveRange(stareStavke);

        rezervacija.Stavke.Clear();

        foreach (var stavka in dogadjaj.Stavke)
        {
            rezervacija.Stavke.Add(
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
                });
        }

        _idempotencija.EvidentirajObradjenDogadjaj(
            dogadjaj.DogadjajId,
            "rezervacija.izmenjena");

        await _kontekst.SaveChangesAsync(
            cancellationToken);
    }
}