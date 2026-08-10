using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Salon.Api.Dto;
using Salon.Domen.Entiteti;
using Salon.Infrastruktura.Podaci;

namespace Salon.Api.Controllers;

[ApiController]
[Route("api/usluge")]
public class UslugeController : ControllerBase
{
    private readonly SalonKontekst _kontekst;

    // Dobijanje pristupa bazi podataka
    public UslugeController(SalonKontekst kontekst)
    {
        _kontekst = kontekst;
    }

    // Prikaz svih usluga
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UslugaDto>>> GetAll()
    {
        var usluge = await _kontekst.Usluge
            .AsNoTracking()
            .OrderBy(u => u.Naziv)
            .Select(u => new UslugaDto
            {
                Id = u.Id,
                Naziv = u.Naziv,
                Opis = u.Opis,
                TrajanjeUMinutima = u.TrajanjeUMinutima,
                MaksimalanBrojKlijenataPoTerminu =
                    u.MaksimalanBrojKlijenataPoTerminu,
                VremePocetkaPrvogTermina =
                    u.VremePocetkaPrvogTermina,
                VremeZavrsetkaPoslednjegTermina =
                    u.VremeZavrsetkaPoslednjegTermina,
                Cena = u.Cena,
                KategorijaUslugeId = u.KategorijaUslugeId,
                KategorijaNaziv = u.KategorijaUsluge.Naziv
            })
            .ToListAsync();

        return Ok(usluge);
    }

    // Prikaz jedne usluge
    [HttpGet("{id}")]
    public async Task<ActionResult<UslugaDto>> GetById(int id)
    {
        var usluga = await _kontekst.Usluge
            .AsNoTracking()
            .Where(u => u.Id == id)
            .Select(u => new UslugaDto
            {
                Id = u.Id,
                Naziv = u.Naziv,
                Opis = u.Opis,
                TrajanjeUMinutima = u.TrajanjeUMinutima,
                MaksimalanBrojKlijenataPoTerminu =
                    u.MaksimalanBrojKlijenataPoTerminu,
                VremePocetkaPrvogTermina =
                    u.VremePocetkaPrvogTermina,
                VremeZavrsetkaPoslednjegTermina =
                    u.VremeZavrsetkaPoslednjegTermina,
                Cena = u.Cena,
                KategorijaUslugeId = u.KategorijaUslugeId,
                KategorijaNaziv = u.KategorijaUsluge.Naziv
            })
            .FirstOrDefaultAsync();

        if (usluga == null)
        {
            return NotFound("Usluga nije pronadjena.");
        }

        return Ok(usluga);
    }

    // Dodavanje nove usluge
    [HttpPost]
    public async Task<ActionResult<UslugaDto>> Post(UslugaDto zahtev)
    {
        // Provera da izabrana kategorija postoji
        var kategorija = await _kontekst.KategorijeUsluga
            .FirstOrDefaultAsync(k => k.Id == zahtev.KategorijaUslugeId);

        if (kategorija == null)
        {
            return BadRequest("Izabrana kategorija ne postoji.");
        }

        // Provera vremena termina
        if (zahtev.VremePocetkaPrvogTermina >=
            zahtev.VremeZavrsetkaPoslednjegTermina)
        {
            return BadRequest(
                "Prvi termin mora poceti pre zavrsetka poslednjeg termina.");
        }

        var usluga = new Usluga
        {
            Naziv = zahtev.Naziv.Trim(),
            Opis = zahtev.Opis.Trim(),
            TrajanjeUMinutima = zahtev.TrajanjeUMinutima,
            MaksimalanBrojKlijenataPoTerminu =
                zahtev.MaksimalanBrojKlijenataPoTerminu,
            VremePocetkaPrvogTermina =
                zahtev.VremePocetkaPrvogTermina,
            VremeZavrsetkaPoslednjegTermina =
                zahtev.VremeZavrsetkaPoslednjegTermina,
            Cena = zahtev.Cena,
            KategorijaUslugeId = zahtev.KategorijaUslugeId
        };

        // Cuvanje nove usluge
        _kontekst.Usluge.Add(usluga);
        await _kontekst.SaveChangesAsync();

        var odgovor = new UslugaDto
        {
            Id = usluga.Id,
            Naziv = usluga.Naziv,
            Opis = usluga.Opis,
            TrajanjeUMinutima = usluga.TrajanjeUMinutima,
            MaksimalanBrojKlijenataPoTerminu =
                usluga.MaksimalanBrojKlijenataPoTerminu,
            VremePocetkaPrvogTermina =
                usluga.VremePocetkaPrvogTermina,
            VremeZavrsetkaPoslednjegTermina =
                usluga.VremeZavrsetkaPoslednjegTermina,
            Cena = usluga.Cena,
            KategorijaUslugeId = usluga.KategorijaUslugeId,
            KategorijaNaziv = kategorija.Naziv
        };

        return CreatedAtAction(
            nameof(GetById),
            new { id = usluga.Id },
            odgovor);
    }

    // Izmena postojece usluge
    [HttpPut("{id}")]
    public async Task<ActionResult<UslugaDto>> Put(
        int id,
        UslugaDto zahtev)
    {
        var usluga = await _kontekst.Usluge
            .FirstOrDefaultAsync(u => u.Id == id);

        if (usluga == null)
        {
            return NotFound("Usluga nije pronadjena.");
        }

        // Provera da izabrana kategorija postoji
        var kategorija = await _kontekst.KategorijeUsluga
            .FirstOrDefaultAsync(k => k.Id == zahtev.KategorijaUslugeId);

        if (kategorija == null)
        {
            return BadRequest("Izabrana kategorija ne postoji.");
        }

        // Provera vremena termina
        if (zahtev.VremePocetkaPrvogTermina >=
            zahtev.VremeZavrsetkaPoslednjegTermina)
        {
            return BadRequest(
                "Prvi termin mora poceti pre zavrsetka poslednjeg termina.");
        }

        usluga.Naziv = zahtev.Naziv.Trim();
        usluga.Opis = zahtev.Opis.Trim();
        usluga.TrajanjeUMinutima = zahtev.TrajanjeUMinutima;
        usluga.MaksimalanBrojKlijenataPoTerminu =
            zahtev.MaksimalanBrojKlijenataPoTerminu;
        usluga.VremePocetkaPrvogTermina =
            zahtev.VremePocetkaPrvogTermina;
        usluga.VremeZavrsetkaPoslednjegTermina =
            zahtev.VremeZavrsetkaPoslednjegTermina;
        usluga.Cena = zahtev.Cena;
        usluga.KategorijaUslugeId = zahtev.KategorijaUslugeId;

        // Cuvanje izmene
        await _kontekst.SaveChangesAsync();

        var odgovor = new UslugaDto
        {
            Id = usluga.Id,
            Naziv = usluga.Naziv,
            Opis = usluga.Opis,
            TrajanjeUMinutima = usluga.TrajanjeUMinutima,
            MaksimalanBrojKlijenataPoTerminu =
                usluga.MaksimalanBrojKlijenataPoTerminu,
            VremePocetkaPrvogTermina =
                usluga.VremePocetkaPrvogTermina,
            VremeZavrsetkaPoslednjegTermina =
                usluga.VremeZavrsetkaPoslednjegTermina,
            Cena = usluga.Cena,
            KategorijaUslugeId = usluga.KategorijaUslugeId,
            KategorijaNaziv = kategorija.Naziv
        };

        return Ok(odgovor);
    }

    // Brisanje usluge
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var usluga = await _kontekst.Usluge
            .FirstOrDefaultAsync(u => u.Id == id);

        if (usluga == null)
        {
            return NotFound("Usluga nije pronadjena.");
        }

        _kontekst.Usluge.Remove(usluga);
        await _kontekst.SaveChangesAsync();

        return NoContent();
    }
}