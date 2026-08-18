using Izvestavanje.Api.Entiteti;
using Izvestavanje.Api.Podaci;
using Microsoft.EntityFrameworkCore;

namespace Izvestavanje.Api.Servisi;

public class IdempotencijaDogadjajaService
{
    private readonly IzvestavanjeKontekst _kontekst;

    public IdempotencijaDogadjajaService(
        IzvestavanjeKontekst kontekst)
    {
        _kontekst = kontekst;
    }

    public async Task<bool> JeObradjenAsync(
        Guid dogadjajId,
        CancellationToken cancellationToken)
    {
        return await _kontekst.ObradjeniDogadjaji
            .AsNoTracking()
            .AnyAsync(
                x => x.DogadjajId == dogadjajId,
                cancellationToken);
    }

    public void EvidentirajObradjenDogadjaj(
        Guid dogadjajId,
        string tipDogadjaja)
    {
        if (dogadjajId == Guid.Empty)
        {
            throw new ArgumentException(
                "DogadjajId ne sme biti prazan.",
                nameof(dogadjajId));
        }

        if (string.IsNullOrWhiteSpace(tipDogadjaja))
        {
            throw new ArgumentException(
                "Tip dogadjaja mora biti zadat.",
                nameof(tipDogadjaja));
        }

        _kontekst.ObradjeniDogadjaji.Add(
            new ObradjenDogadjaj
            {
                DogadjajId = dogadjajId,
                TipDogadjaja = tipDogadjaja,
                VremeObrade = DateTime.UtcNow
            });
    }
}