using Microsoft.AspNetCore.Mvc; 
using Salon.Api.Dto; 
using Salon.Infrastruktura.Servisi; 
 
namespace Salon.Api.Controllers; 
 
[ApiController] 
[Route("api/termini")] 
public class TerminiController : ControllerBase 
{ 
    private readonly TerminService _terminService; 
 
    // Pristup poslovnoj logici termina 
    public TerminiController(TerminService terminService) 
    { 
        _terminService = terminService; 
    } 
 
    // Prikaz slobodnih termina za uslugu i datum 
[HttpGet("usluga/{uslugaId}")] 
public async Task<IActionResult> Get( 
    int uslugaId, 
    [FromQuery] DateTime datum) 
{ 
    if (datum == default) 
    { 
        return BadRequest("Datum je obavezan."); 
    } 
 
    var termini = await _terminService 
        .VratiDostupneTermineAsync(uslugaId, datum); 
 
    if (termini == null) 
    { 
        return NotFound("Usluga nije pronadjena."); 
    } 
 
    var odgovor = termini.Select(t => new TerminDto 
    { 
        Datum = t.Datum, 
        VremePocetka = t.VremePocetka, 
        DostupnaMesta = t.DostupnaMesta 
    }); 
 
    return Ok(odgovor); 
} 
}