using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Salon.Api.Dto;
using Salon.Domen.Entiteti;
using Salon.Infrastruktura.Podaci;

namespace Salon.Api.Controllers;

[ApiController]
[Route("api/kategorije-usluga")]
public class KategorijeUslugaController : ControllerBase
{
    private readonly SalonKontekst _kontekst;

    // Dobijanje pristupa bazi podataka
    public KategorijeUslugaController(SalonKontekst kontekst)
    {
        _kontekst = kontekst;
    }

    // Prikaz svih kategorija
    [HttpGet]
    public async Task<ActionResult<IEnumerable<KategorijaUslugeDto>>> GetAll()
    {
        var kategorije = await _kontekst.KategorijeUsluga
            .AsNoTracking()
            .OrderBy(k => k.Naziv)
            .Select(k => new KategorijaUslugeDto
            {
                Id = k.Id,
                Naziv = k.Naziv
            })
            .ToListAsync();

        return Ok(kategorije);
    }

    // Prikaz jedne kategorije
    [HttpGet("{id}")]
    public async Task<ActionResult<KategorijaUslugeDto>> GetById(int id)
    {
        var kategorija = await _kontekst.KategorijeUsluga
            .AsNoTracking()
            .FirstOrDefaultAsync(k => k.Id == id);

        if (kategorija == null)
        {
            return NotFound("Kategorija nije pronadjena.");
        }

        var odgovor = new KategorijaUslugeDto
        {
            Id = kategorija.Id,
            Naziv = kategorija.Naziv
        };

        return Ok(odgovor);
    }

    // Dodavanje nove kategorije
    [HttpPost]
    public async Task<ActionResult<KategorijaUslugeDto>> Post(
        KategorijaUslugeDto zahtev)
    {
        var kategorija = new KategorijaUsluge
        {
            Naziv = zahtev.Naziv.Trim()
        };

        _kontekst.KategorijeUsluga.Add(kategorija);
        await _kontekst.SaveChangesAsync();

        var odgovor = new KategorijaUslugeDto
        {
            Id = kategorija.Id,
            Naziv = kategorija.Naziv
        };

        return CreatedAtAction(
            nameof(GetById),
            new { id = kategorija.Id },
            odgovor);
    }

    // Izmena postojece kategorije
    [HttpPut("{id}")]
    public async Task<ActionResult<KategorijaUslugeDto>> Put(
        int id,
        KategorijaUslugeDto zahtev)
    {
        var kategorija = await _kontekst.KategorijeUsluga
            .FirstOrDefaultAsync(k => k.Id == id);

        if (kategorija == null)
        {
            return NotFound("Kategorija nije pronadjena.");
        }

        kategorija.Naziv = zahtev.Naziv.Trim();

        // Cuvanje izmene u bazi
        await _kontekst.SaveChangesAsync();

        var odgovor = new KategorijaUslugeDto
        {
            Id = kategorija.Id,
            Naziv = kategorija.Naziv
        };

        return Ok(odgovor);
    }

    // Brisanje kategorije
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var kategorija = await _kontekst.KategorijeUsluga
            .FirstOrDefaultAsync(k => k.Id == id);

        if (kategorija == null)
        {
            return NotFound("Kategorija nije pronadjena.");
        }

        // Kategorija sa uslugama se ne brise
        var imaUsluge = await _kontekst.Usluge
            .AnyAsync(u => u.KategorijaUslugeId == id);

        if (imaUsluge)
        {
            return BadRequest(
                "Kategorija se ne moze obrisati jer sadrzi usluge.");
        }

        _kontekst.KategorijeUsluga.Remove(kategorija);
        await _kontekst.SaveChangesAsync();

        return NoContent();
    }
}