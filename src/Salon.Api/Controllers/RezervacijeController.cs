using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Salon.Api.Dto;
using Salon.Api.Servisi;
using Salon.Domen.Entiteti;
using Salon.Domen.Enumeracije;
using Salon.Infrastruktura.Podaci;
using Salon.Infrastruktura.Servisi;
using Zajednicko.Poruke.Komande;

namespace Salon.Api.Controllers;

[ApiController]
[Route("api/rezervacije")]
public class RezervacijeController : ControllerBase
{
    private readonly RabbitMqPublisherService _publisher;
    private readonly SalonKontekst _kontekst;

    private readonly UpravljanjeRezervacijomService _upravljanje;

    public RezervacijeController(
        RabbitMqPublisherService publisher,
        SalonKontekst kontekst,
        UpravljanjeRezervacijomService upravljanje)
    {
        _publisher = publisher;
        _kontekst = kontekst;
        _upravljanje = upravljanje;
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

        await _kontekst.SaveChangesAsync(
            cancellationToken);

        try
        {
            // Rezervacija se salje u message queue
            await _publisher.PosaljiKreiranjeRezervacijeAsync(
                komanda,
                cancellationToken);
        }
        catch
        {
            pracenje.Status =
                StatusObradeRezervacije.ODBIJENA;

            pracenje.Poruka =
                "Zahtev nije mogao biti poslat na obradu.";

            pracenje.DatumIzmene =
                DateTime.UtcNow;

            await _kontekst.SaveChangesAsync(
                cancellationToken);

            throw;
        }

        return Accepted(new
        {
            IdZahteva = komanda.IdZahteva,
            Status = pracenje.Status.ToString(),
            Poruka =
                "Zahtev za rezervaciju je primljen."
        });
    }

    // Provera statusa asinhrone obrade
    [HttpGet("status/{idZahteva:guid}")]
    public async Task<IActionResult> Status(
        Guid idZahteva,
        CancellationToken cancellationToken)
    {
        var zahtev =
            await _kontekst.ZahteviZaRezervaciju
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    z => z.IdZahteva == idZahteva,
                    cancellationToken);

        if (zahtev == null)
        {
            return NotFound(
                "Zahtev sa tim identifikatorom nije pronadjen.");
        }

        string? sifra = null;
        string? promoKod = null;

        // Sifra i promo kod postoje tek nakon uspesne obrade
        if (zahtev.Status ==
                StatusObradeRezervacije.USPESNA &&
            zahtev.RezervacijaId.HasValue)
        {
            sifra = await _kontekst.Rezervacije
                .AsNoTracking()
                .Where(r =>
                    r.Id == zahtev.RezervacijaId.Value)
                .Select(r => r.Sifra)
                .FirstOrDefaultAsync(
                    cancellationToken);

            promoKod = await _kontekst.PromoKodovi
                .AsNoTracking()
                .Where(p =>
                    p.RezervacijaId ==
                    zahtev.RezervacijaId.Value)
                .Select(p => p.Kod)
                .FirstOrDefaultAsync(
                    cancellationToken);
        }

        return Ok(new
        {
            zahtev.IdZahteva,
            Status = zahtev.Status.ToString(),
            zahtev.Poruka,
            zahtev.RezervacijaId,

            Sifra = sifra,
            PromoKod = promoKod,

            zahtev.DatumKreiranja,
            zahtev.DatumIzmene
        });
    }

    // Pristup postojecoj rezervaciji preko email-a i sifre
    [HttpPost("pristup")]
    public async Task<IActionResult> Pristup(
        PristupRezervacijiDto zahtev,
        CancellationToken cancellationToken)
    {
        var email = zahtev.Email.Trim();

        var sifra =
            zahtev.Sifra
                .Trim()
                .ToUpperInvariant();

        // Provera kombinacije email + pristupna sifra
        var rezervacija =
            await _kontekst.Rezervacije
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    r =>
                        r.Email.ToLower() ==
                            email.ToLower() &&
                        r.Sifra == sifra,
                    cancellationToken);

        if (rezervacija == null)
        {
            return NotFound(
                "Rezervacija nije pronadjena.");
        }

        // Ucitavanje svih usluga rezervacije
        var stavke =
            await _kontekst.StavkeRezervacija
                .AsNoTracking()
                .Where(s =>
                    s.RezervacijaId ==
                    rezervacija.Id)
                .Select(s =>
                    new StavkaRezervacijeDetaljiDto
                    {
                        Id = s.Id,
                        UslugaId = s.UslugaId,
                        NazivUsluge =
                            s.Usluga.Naziv,
                        Datum = s.Datum,
                        VremePocetka =
                            s.VremePocetka,
                        CenaRsd = s.Cena
                    })
                .ToListAsync(
                    cancellationToken);

        // Promo kod generisan ovom rezervacijom
        var promoKod =
            await _kontekst.PromoKodovi
                .AsNoTracking()
                .Where(p =>
                    p.RezervacijaId ==
                    rezervacija.Id)
                .Select(p => p.Kod)
                .FirstOrDefaultAsync(
                    cancellationToken);

        var rezultat =
            new RezervacijaDetaljiDto
            {
                Id = rezervacija.Id,

                Ime = rezervacija.Ime,
                Prezime = rezervacija.Prezime,
                Email = rezervacija.Email,

                Status =
                    rezervacija.Status.ToString(),

                IzabranaValuta =
                    rezervacija.IzabranaValuta,

                UkupnaCena =
                    rezervacija.UkupnaCena,

                Popust =
                    rezervacija.Popust,

                KonacnaCena =
                    rezervacija.KonacnaCena,

                Kurs =
                    rezervacija.Kurs,

                DatumKreiranja =
                    rezervacija.DatumKreiranja,

                DatumOtkazivanja =
                    rezervacija.DatumOtkazivanja,

                PromoKod =
                    promoKod,

                Stavke =
                    stavke
            };

        return Ok(rezultat);
    }

    [HttpPost("{id:int}/stavke")]
    public async Task<IActionResult> DodajStavku(
    int id,
    DodajStavkuRezervacijeDto zahtev,
    CancellationToken cancellationToken)
    {
        try
        {
            await _upravljanje.DodajStavkuAsync(
                id, zahtev.Email, zahtev.Sifra, zahtev.UslugaId,
                zahtev.Datum, zahtev.VremePocetka, cancellationToken);

            return Ok(new { Poruka = "Usluga je dodata na rezervaciju." });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}