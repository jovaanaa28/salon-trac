using System.Net.Http.Json; 
 
namespace Salon.Infrastruktura.Servisi; 
 
public class KursService 
{ 
    private readonly HttpClient _httpClient; 
 
    // HttpClient dobija adresu Frankfurter API-ja iz Program.cs 
    public KursService(HttpClient httpClient) 
    { 
        _httpClient = httpClient; 
    } 
 
    // Kurs predstavlja koliko jedinica izabrane valute vredi 1 RSD 
    public async Task<decimal> VratiKursIzRsdAsync(string valuta) 
    { 
        var oznaka = valuta.Trim().ToUpperInvariant(); 
 
        if (oznaka == "RSD") 
        { 
            return 1m; 
        } 
 
        var odgovor = await _httpClient 
            .GetFromJsonAsync<FrankfurterOdgovor>( 
                $"rate/RSD/{oznaka}"); 
 
        if (odgovor == null || odgovor.Rate <= 0) 
        { 
            throw new InvalidOperationException( 
                "Kurs nije moguce dobiti."); 
        } 
 
        return odgovor.Rate; 
    } 
 
    // Preracunavanje RSD iznosa u izabranu valutu 
    public async Task<decimal> PreracunajIzRsdAsync( 
        decimal iznosRsd, 
        string valuta) 
    { 
        var kurs = await VratiKursIzRsdAsync(valuta); 
 
        return Math.Round( 
            iznosRsd * kurs, 
            2, 
            MidpointRounding.AwayFromZero); 
    } 
 
    private sealed class FrankfurterOdgovor 
    { 
        public string Date { get; set; } = string.Empty; 
        public string Base { get; set; } = string.Empty; 
        public string Quote { get; set; } = string.Empty; 
        public decimal Rate { get; set; } 
    } 
} 