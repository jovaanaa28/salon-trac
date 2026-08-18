using Izvestavanje.Api.Podaci;
using Microsoft.EntityFrameworkCore;
using Zajednicko.Poruke.Dogadjaji;
namespace Izvestavanje.Api.Servisi;
public class ObradaOtkazaneRezervacijeService
{
    private readonly IzvestavanjeKontekst _kontekst;
    private readonly IdempotencijaDogadjajaService _idempotencija;
    public ObradaOtkazaneRezervacijeService(
        IzvestavanjeKontekst kontekst,
        IdempotencijaDogadjajaService idempotencija)
    {
        _kontekst = kontekst;
        _idempotencija = idempotencija;
    }
    public async Task ObradiAsync(
        RezervacijaOtkazanaDogadjaj dogadjaj,
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
        var rezervacija =
            await _kontekst.Rezervacije
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
        // Rezervaciju NE brisemo.
        // DatumKreiranja i stavke ostaju sacuvani
        // zbog istorijskih izvestaja.
        rezervacija.Status =
            dogadjaj.Status;
        _idempotencija.EvidentirajObradjenDogadjaj(
            dogadjaj.DogadjajId,
            "rezervacija.otkazana");
        await _kontekst.SaveChangesAsync(
            cancellationToken);
    }
}