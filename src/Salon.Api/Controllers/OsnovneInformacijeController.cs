using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Salon.Api.Dto;
using Salon.Domen.Entiteti;
using Salon.Infrastruktura.Podaci;

namespace Salon.Api.Controllers;

[ApiController]
[Route("api/osnovne-informacije")]
public class OsnovneInformacijeController : ControllerBase
{
    private readonly SalonKontekst _kontekst;

    // Dobijanje pristupa bazi podataka
    public OsnovneInformacijeController(SalonKontekst kontekst)
    {
        _kontekst = kontekst;
    }

    // Prikaz osnovnih informacija salona
    [HttpGet]
    public async Task<ActionResult<OsnovneInformacijeDto>> Get()
    {
        var informacije = await _kontekst.OsnovneInformacije
            .AsNoTracking()
            .FirstOrDefaultAsync();

        if (informacije == null)
        {
            return NotFound("Osnovne informacije salona jos nisu unete.");
        }

        var odgovor = new OsnovneInformacijeDto
        {
            Naziv = informacije.Naziv,
            Lokacija = informacije.Lokacija,
            Opis = informacije.Opis,
            RadnoVreme = informacije.RadnoVreme
        };

        return Ok(odgovor);
    }

    // Dodavanje ili izmena osnovnih informacija salona
    [HttpPut]
    public async Task<ActionResult<OsnovneInformacijeDto>> Put(
        OsnovneInformacijeDto zahtev)
    {
        var informacije = await _kontekst.OsnovneInformacije
            .FirstOrDefaultAsync();

        // Ako podaci jos ne postoje, kreira se prvi zapis
        if (informacije == null)
        {
            informacije = new OsnovneInformacije();
            _kontekst.OsnovneInformacije.Add(informacije);
        }

        informacije.Naziv = zahtev.Naziv.Trim();
        informacije.Lokacija = zahtev.Lokacija.Trim();
        informacije.Opis = zahtev.Opis.Trim();
        informacije.RadnoVreme = zahtev.RadnoVreme.Trim();

        // Cuvanje promena u bazi
        await _kontekst.SaveChangesAsync();

        var odgovor = new OsnovneInformacijeDto
        {
            Naziv = informacije.Naziv,
            Lokacija = informacije.Lokacija,
            Opis = informacije.Opis,
            RadnoVreme = informacije.RadnoVreme
        };

        return Ok(odgovor);
    }
}