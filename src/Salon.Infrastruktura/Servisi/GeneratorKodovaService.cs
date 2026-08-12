using Microsoft.EntityFrameworkCore; 
using Salon.Infrastruktura.Podaci; 
 
namespace Salon.Infrastruktura.Servisi; 
 
public class GeneratorKodovaService 
{ 
    private readonly SalonKontekst _kontekst; 
 
    // Pristup bazi radi provere jedinstvenosti kodova 
    public GeneratorKodovaService(SalonKontekst kontekst) 
    { 
        _kontekst = kontekst; 
    } 
 
    // Generisanje jedinstvene sifre za kasniji pristup rezervaciji 
    public async Task<string> GenerisiSifruRezervacijeAsync() 
    { 
        string sifra; 
 
        do 
        { 
            sifra = Guid.NewGuid() 
                .ToString("N")[..10] 
                .ToUpperInvariant(); 
        } 
        while (await _kontekst.Rezervacije 
            .AnyAsync(r => r.Sifra == sifra)); 
 
        return sifra; 
    } 
 
    // Generisanje jedinstvenog promo-koda 
    public async Task<string> GenerisiPromoKodAsync() 
    { 
        string kod; 
 
        do 
        { 
            kod = "PROMO-" + Guid.NewGuid() 
                .ToString("N")[..8] 
                .ToUpperInvariant(); 
        } 
        while (await _kontekst.PromoKodovi 
            .AnyAsync(p => p.Kod == kod)); 
 
        return kod; 
    } 
} 