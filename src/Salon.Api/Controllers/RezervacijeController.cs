using Microsoft.AspNetCore.Mvc;
using Salon.Api.Dto;
using Salon.Api.Servisi;
using Zajednicko.Poruke.Komande;

namespace Salon.Api.Controllers;

[ApiController]
[Route("api/rezervacije")]
public class RezervacijeController : ControllerBase
{
    private readonly RabbitMqPublisherService _publisher;

    public RezervacijeController(
        RabbitMqPublisherService publisher)
    {
        _publisher = publisher;
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

        // Rezervacija se prvo salje u message queue
        await _publisher.PosaljiKreiranjeRezervacijeAsync(
            komanda,
            cancellationToken);

        return Accepted(new
        {
            IdZahteva = komanda.IdZahteva,
            Poruka = "Zahtev za rezervaciju je primljen."
        });
    }
}