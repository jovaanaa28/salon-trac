using Microsoft.AspNetCore.Mvc; 
using Microsoft.EntityFrameworkCore; 
using Salon.Infrastruktura.Podaci; 
using Salon.Infrastruktura.Servisi; 
 
namespace Salon.Api.Controllers; 
 
[ApiController] 
[Route("api/kurs")] 
public class KursController : ControllerBase 
{ 
    private readonly KursService _kursService; 
    private readonly SalonKontekst _kontekst; 
 
    public KursController( 
        KursService kursService, 
        SalonKontekst kontekst) 
    { 
        _kursService = kursService; 
        _kontekst = kontekst; 
    } 
 
    // Provera kursa samo za valute dozvoljene u administraciji 
    [HttpGet("{valuta}")] 
    public async Task<IActionResult> Get(string valuta) 
    { 
        var oznaka = valuta.Trim().ToUpperInvariant(); 
 
        var dozvoljena = await _kontekst.DozvoljeneValute 
            .AsNoTracking() 
            .AnyAsync(v => v.Oznaka == oznaka); 
 
        if (!dozvoljena) 
        { 
            return BadRequest("Valuta nije dozvoljena."); 
        } 
 
        try 
        { 
            var kurs = await _kursService 
                .VratiKursIzRsdAsync(oznaka); 
 
            return Ok(new 
            { 
                OsnovnaValuta = "RSD", 
                IzabranaValuta = oznaka, 
                Kurs = kurs 
            }); 
        } 
        catch (HttpRequestException) 
        { 
            return StatusCode( 
                StatusCodes.Status503ServiceUnavailable, 
                "Servis za kurs trenutno nije dostupan."); 
        } 
        catch (InvalidOperationException ex) 
        { 
            return StatusCode( 
                StatusCodes.Status503ServiceUnavailable, 
                ex.Message); 
        } 
    } 
} 