using Izvestavanje.Api.Podaci;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Izvestavanje.Api.Kontroleri;

[ApiController]
public class ZdravljeController : ControllerBase
{
    private readonly IzvestavanjeKontekst _kontekst;

    public ZdravljeController(IzvestavanjeKontekst kontekst)
    {
        _kontekst = kontekst;
    }

    [HttpGet("/zdravlje")]
    public async Task<IActionResult> Proveri()
    {
        try
        {
            var brojRezervacija =
                await _kontekst.Rezervacije.CountAsync();

            return Ok(new
            {
                status = "OK",
                api = "Izvestavanje.Api",
                baza = "povezana",
                brojRezervacija
            });
        }
        catch
        {
            return StatusCode(
                StatusCodes.Status503ServiceUnavailable,
                new
                {
                    status = "GRESKA",
                    api = "Izvestavanje.Api",
                    baza = "nedostupna"
                });
        }
    }
}