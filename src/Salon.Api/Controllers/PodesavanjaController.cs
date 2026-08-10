using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Salon.Api.Dto;
using Salon.Infrastruktura.Podaci;

namespace Salon.Api.Controllers;

[ApiController]
[Route("api/podesavanja")]
public class PodesavanjaController : ControllerBase
{
    private readonly SalonKontekst _kontekst;

    // Dobijanje pristupa bazi podataka
    public PodesavanjaController(SalonKontekst kontekst)
    {
        _kontekst = kontekst;
    }

    // Prikaz datuma do kada vazi popust
    [HttpGet("datum-popusta")]
    public async Task<ActionResult<DatumPopustaDto>> GetDatumPopusta()
    {
        var informacije = await _kontekst.OsnovneInformacije
            .AsNoTracking()
            .FirstOrDefaultAsync();

        if (informacije == null)
        {
            return NotFound("Osnovne informacije salona nisu pronadjene.");
        }

        return Ok(new DatumPopustaDto
        {
            DatumDoKadaVaziPopust =
                informacije.DatumDoKadaVaziPopust
        });
    }

    // Izmena datuma do kada vazi popust
    [HttpPut("datum-popusta")]
    public async Task<ActionResult<DatumPopustaDto>> PutDatumPopusta(
        DatumPopustaDto zahtev)
    {
        var informacije = await _kontekst.OsnovneInformacije
            .FirstOrDefaultAsync();

        if (informacije == null)
        {
            return NotFound("Osnovne informacije salona nisu pronadjene.");
        }

        informacije.DatumDoKadaVaziPopust =
            zahtev.DatumDoKadaVaziPopust;

        // Cuvanje novog datuma popusta
        await _kontekst.SaveChangesAsync();

        return Ok(new DatumPopustaDto
        {
            DatumDoKadaVaziPopust =
                informacije.DatumDoKadaVaziPopust
        });
    }
}