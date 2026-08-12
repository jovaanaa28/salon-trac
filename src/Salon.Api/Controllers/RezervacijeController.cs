using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Salon.Api.Dto;
using Salon.Api.Servisi;
using Salon.Domen.Entiteti;
using Salon.Domen.Enumeracije;
using Salon.Infrastruktura.Podaci;
using Zajednicko.Poruke.Komande;

namespace Salon.Api.Controllers;

[ApiController]
[Route("api/rezervacije")]
public class RezervacijeController : ControllerBase
{
    private readonly RabbitMqPublisherService _publisher;
    private readonly SalonKontekst _kontekst;

    public RezervacijeController(
        RabbitMqPublisherService publisher,
        SalonKontekst kontekst)
    {
        _publisher = publisher;
        _kontekst = kontekst;
    }

    // Slanje zahteva za novu rezervaciju na asinhronu obradu
    [HttpPost]
    public async Task<IActionResult> Kreiraj(
        KreirajRezervacijuDto zahtev,
        CancellationToken cancellationToken)
    {
        var komanda = new KreirajRezervacijuKomanda
        {
            IdZahteva = Guid.NewGuid(),

            Ime = zahtev.Ime.Trim(),
            Prezime = zahtev.Prezime.Trim(),
            Adresa = zahtev.Adresa.Trim(),
            PostanskiBroj = zahtev.PostanskiBroj.Trim(),
            Mesto = zahtev.Mesto.Trim(),
            Drzava = zahtev.Drzava.Trim(),
            Email = zahtev.Email.Trim(),

            IzabranaValuta =
                zahtev.IzabranaValuta.Trim().ToUpperInvariant(),

            PromoKod = string.IsNullOrWhiteSpace(zahtev.PromoKod)
                ? null
                : zahtev.PromoKod.Trim().ToUpperInvariant(),

            Stavke = zahtev.Stavke
                .Select(s => new StavkaRezervacijeKomanda
                {
                    UslugaId = s.UslugaId,
                    Datum = s.Datum.Date,
                    VremePocetka = s.VremePocetka
                })
                .ToList()
        };

        // Cuvamo samo status zahteva, ne samu rezervaciju
        var pracenje = new ZahtevZaRezervaciju
        {
            IdZahteva = komanda.IdZahteva,
            Status = StatusObradeRezervacije.NA_CEKANJU,
            Poruka = "Zahtev ceka obradu.",
            DatumKreiranja = DateTime.UtcNow,
            DatumIzmene = DateTime.UtcNow
        };

        _kontekst.ZahteviZaRezervaciju.Add(pracenje);
        await _kontekst.SaveChangesAsync(cancellationToken);

        try
        {
            // Rezervacija se salje u message queue
            await _publisher.PosaljiKreiranjeRezervacijeAsync(
                komanda,
                cancellationToken);
        }
        catch
        {
            pracenje.Status = StatusObradeRezervacije.ODBIJENA;
            pracenje.Poruka =
                "Zahtev nije mogao biti poslat na obradu.";
            pracenje.DatumIzmene = DateTime.UtcNow;

            await _kontekst.SaveChangesAsync(cancellationToken);

            throw;
        }

        return Accepted(new
        {
            IdZahteva = komanda.IdZahteva,
            Status = pracenje.Status.ToString(),
            Poruka = "Zahtev za rezervaciju je primljen."
        });
    }

    // Provera statusa asinhrone obrade
    [HttpGet("status/{idZahteva:guid}")]
    public async Task<IActionResult> Status(
        Guid idZahteva,
        CancellationToken cancellationToken)
    {
        var zahtev = await _kontekst.ZahteviZaRezervaciju
            .AsNoTracking()
            .FirstOrDefaultAsync(
                z => z.IdZahteva == idZahteva,
                cancellationToken);

        if (zahtev == null)
        {
            return NotFound(
                "Zahtev sa tim identifikatorom nije pronadjen.");
        }

        return Ok(new
        {
            zahtev.IdZahteva,
            Status = zahtev.Status.ToString(),
            zahtev.Poruka,
            zahtev.RezervacijaId,
            zahtev.DatumKreiranja,
            zahtev.DatumIzmene
        });
    }
}