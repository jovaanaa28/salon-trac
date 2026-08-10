using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Salon.Api.Dto;
using Salon.Domen.Entiteti;
using Salon.Infrastruktura.Podaci;
using System.Text.Json;

namespace Salon.Api.Controllers;

[ApiController]
[Route("api/osnovne-informacije")]
public class OsnovneInformacijeController : ControllerBase
{
    private readonly SalonKontekst _kontekst;
    private readonly IDistributedCache _cache;

    private const string CacheKljuc = "osnovne-informacije";

    // Dobijanje pristupa bazi i Redis cache-u
    public OsnovneInformacijeController(
        SalonKontekst kontekst,
        IDistributedCache cache)
    {
        _kontekst = kontekst;
        _cache = cache;
    }

    // Prikaz osnovnih informacija salona
    [HttpGet]
    public async Task<ActionResult<OsnovneInformacijeDto>> Get()
    {
        // Prvo se proverava Redis cache
        var kesiraniPodaci = await _cache.GetStringAsync(CacheKljuc);

        if (kesiraniPodaci != null)
        {
            var kesiraniOdgovor =
                JsonSerializer.Deserialize<OsnovneInformacijeDto>(
                    kesiraniPodaci);

            return Ok(kesiraniOdgovor);
        }

        // Ako nema cache-a, podaci se citaju iz baze
        var informacije = await _kontekst.OsnovneInformacije
            .AsNoTracking()
            .FirstOrDefaultAsync();

        if (informacije == null)
        {
            return NotFound(
                "Osnovne informacije salona jos nisu unete.");
        }

        var odgovor = new OsnovneInformacijeDto
        {
            Naziv = informacije.Naziv,
            Lokacija = informacije.Lokacija,
            Opis = informacije.Opis,
            RadnoVreme = informacije.RadnoVreme
        };

        // Cuvanje podataka u Redis cache-u
        await _cache.SetStringAsync(
            CacheKljuc,
            JsonSerializer.Serialize(odgovor),
            new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow =
                    TimeSpan.FromMinutes(30)
            });

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

        // Brisanje starih podataka iz cache-a
        await _cache.RemoveAsync(CacheKljuc);

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