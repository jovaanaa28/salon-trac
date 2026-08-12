using System.ComponentModel.DataAnnotations; 
 
namespace Salon.Api.Dto; 
 
public class ObracunCeneRequestDto 
{ 
    [Range(0, double.MaxValue)] 
    public decimal UkupnaCenaRsd { get; set; } 
 
    public string? PromoKod { get; set; } 
} 
 
public class ObracunCeneResponseDto 
{ 
    public decimal UkupnaCenaRsd { get; set; } 
    public decimal ProcenatPopusta { get; set; } 
    public decimal IznosPopustaRsd { get; set; } 
    public decimal KonacnaCenaRsd { get; set; } 
    public bool PromoKodVazi { get; set; } 
} 