using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Salon.Api.Dto;
using Salon.Domen.Entiteti;
using Salon.Infrastruktura.Podaci;

namespace Salon.Api.Controllers;

[ApiController]
[Route("api/valute")]
public class ValuteController : ControllerBase
{
    private readonly SalonKontekst _kontekst;

    // Dobijanje pristupa bazi podataka
    public ValuteController(SalonKontekst kontekst)
    {
        _kontekst = kontekst;
    }

    // Prikaz svih dozvoljenih valuta
    [HttpGet]
    public async Task<ActionResult<IEnumerable<DozvoljenaValutaDto>>> GetAll()
    {
        var valute = await _kontekst.DozvoljeneValute
            .AsNoTracking()
            .OrderBy(v => v.Oznaka)
            .Select(v => new DozvoljenaValutaDto
            {
                Id = v.Id,
                Oznaka = v.Oznaka,
                Naziv = v.Naziv
            })
            .ToListAsync();

        return Ok(valute);
    }

    // Prikaz jedne valute
    [HttpGet("{id}")]
    public async Task<ActionResult<DozvoljenaValutaDto>> GetById(int id)
    {
        var valuta = await _kontekst.DozvoljeneValute
            .AsNoTracking()
            .FirstOrDefaultAsync(v => v.Id == id);

        if (valuta == null)
        {
            return NotFound("Valuta nije pronadjena.");
        }

        return Ok(new DozvoljenaValutaDto
        {
            Id = valuta.Id,
            Oznaka = valuta.Oznaka,
            Naziv = valuta.Naziv
        });
    }

    // Dodavanje dozvoljene valute
    [HttpPost]
    public async Task<ActionResult<DozvoljenaValutaDto>> Post(
        DozvoljenaValutaDto zahtev)
    {
        var oznaka = zahtev.Oznaka.Trim().ToUpperInvariant();

        // Provera da valuta vec ne postoji
        var postoji = await _kontekst.DozvoljeneValute
            .AnyAsync(v => v.Oznaka == oznaka);

        if (postoji)
        {
            return BadRequest("Valuta sa tom oznakom vec postoji.");
        }

        var valuta = new DozvoljenaValuta
        {
            Oznaka = oznaka,
            Naziv = zahtev.Naziv.Trim()
        };

        _kontekst.DozvoljeneValute.Add(valuta);
        await _kontekst.SaveChangesAsync();

        var odgovor = new DozvoljenaValutaDto
        {
            Id = valuta.Id,
            Oznaka = valuta.Oznaka,
            Naziv = valuta.Naziv
        };

        return CreatedAtAction(
            nameof(GetById),
            new { id = valuta.Id },
            odgovor);
    }

    // Izmena dozvoljene valute
    [HttpPut("{id}")]
    public async Task<ActionResult<DozvoljenaValutaDto>> Put(
        int id,
        DozvoljenaValutaDto zahtev)
    {
        var valuta = await _kontekst.DozvoljeneValute
            .FirstOrDefaultAsync(v => v.Id == id);

        if (valuta == null)
        {
            return NotFound("Valuta nije pronadjena.");
        }

        var oznaka = zahtev.Oznaka.Trim().ToUpperInvariant();

        // Provera duplikata oznake
        var postoji = await _kontekst.DozvoljeneValute
            .AnyAsync(v => v.Oznaka == oznaka && v.Id != id);

        if (postoji)
        {
            return BadRequest("Valuta sa tom oznakom vec postoji.");
        }

        valuta.Oznaka = oznaka;
        valuta.Naziv = zahtev.Naziv.Trim();

        await _kontekst.SaveChangesAsync();

        return Ok(new DozvoljenaValutaDto
        {
            Id = valuta.Id,
            Oznaka = valuta.Oznaka,
            Naziv = valuta.Naziv
        });
    }

    // Brisanje dozvoljene valute
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var valuta = await _kontekst.DozvoljeneValute
            .FirstOrDefaultAsync(v => v.Id == id);

        if (valuta == null)
        {
            return NotFound("Valuta nije pronadjena.");
        }

        _kontekst.DozvoljeneValute.Remove(valuta);
        await _kontekst.SaveChangesAsync();

        return NoContent();
    }
}