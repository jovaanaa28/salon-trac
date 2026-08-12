using Microsoft.AspNetCore.Mvc; 
using Salon.Api.Dto; 
using Salon.Infrastruktura.Servisi; 
 
namespace Salon.Api.Controllers; 
 
[ApiController] 
[Route("api/obracun")] 
public class ObracunController : ControllerBase 
{ 
    private readonly ObracunCeneService _obracunCeneService; 
 
    public ObracunController(ObracunCeneService obracunCeneService) 
    { 
        _obracunCeneService = obracunCeneService; 
    } 
 
    // Pregled cene pre konacne obrade rezervacije 
    [HttpPost("preview")] 
    public async Task<ActionResult<ObracunCeneResponseDto>> Preview( 
        ObracunCeneRequestDto zahtev) 
    { 
        var rezultat = await _obracunCeneService 
            .IzracunajAsync(zahtev.UkupnaCenaRsd, zahtev.PromoKod); 
 
        return Ok(new ObracunCeneResponseDto 
        { 
            UkupnaCenaRsd = rezultat.UkupnaCenaRsd, 
            ProcenatPopusta = rezultat.ProcenatPopusta, 
            IznosPopustaRsd = rezultat.IznosPopustaRsd, 
            KonacnaCenaRsd = rezultat.KonacnaCenaRsd, 
            PromoKodVazi = rezultat.PromoKodVazi 
        }); 
    } 
} 