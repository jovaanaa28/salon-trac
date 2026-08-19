using Izvestavanje.Api.Dto;
using Izvestavanje.Api.Podaci;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Izvestavanje.Api.Kontroleri;

[ApiController]
[Route("api/izvestaji")]
public class IzvestajiController : ControllerBase
{
    private readonly IzvestavanjeKontekst _kontekst;

    public IzvestajiController(
        IzvestavanjeKontekst kontekst)
    {
        _kontekst = kontekst;
    }

    [HttpGet("termini-po-kategoriji")]
    public async Task<
        ActionResult<List<TerminiPoKategorijiDto>>>
        TerminiPoKategoriji(
            CancellationToken cancellationToken)
    {
        var rezultat =
            await _kontekst.StavkeRezervacija
                .AsNoTracking()
                .GroupBy(stavka => new
                {
                    stavka.KategorijaUslugeId,
                    stavka.NazivKategorije
                })
                .Select(grupa =>
                    new TerminiPoKategorijiDto
                    {
                        KategorijaUslugeId =
                            grupa.Key.KategorijaUslugeId,

                        NazivKategorije =
                            grupa.Key.NazivKategorije,

                        BrojRezervisanihTermina =
                            grupa.Count(stavka =>
                                stavka.IzvestajnaRezervacija
                                    .Status != "OTKAZANA")
                    })
                .OrderBy(x => x.NazivKategorije)
                .ToListAsync(cancellationToken);

        return Ok(rezultat);
    }

    [HttpGet("rezervacije-po-datumu")]
    public async Task<
        ActionResult<List<RezervacijePoDatumuDto>>>
        RezervacijePoDatumu(
            CancellationToken cancellationToken)
    {
        var rezultat =
            await _kontekst.Rezervacije
                .AsNoTracking()
                .GroupBy(rezervacija =>
                    rezervacija.DatumKreiranja.Date)
                .Select(grupa =>
                    new RezervacijePoDatumuDto
                    {
                        Datum = grupa.Key,
                        BrojRezervacija = grupa.Count()
                    })
                .OrderBy(x => x.Datum)
                .ToListAsync(cancellationToken);

        return Ok(rezultat);
    }
}