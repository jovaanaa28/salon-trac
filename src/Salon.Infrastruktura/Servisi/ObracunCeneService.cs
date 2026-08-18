using Microsoft.EntityFrameworkCore; 
using Salon.Domen.Enumeracije; 
using Salon.Domen.Modeli; 
using Salon.Infrastruktura.Podaci; 
 
namespace Salon.Infrastruktura.Servisi; 
 
public class ObracunCeneService 
{ 
    private readonly SalonKontekst _kontekst; 
 
    // Pristup datumu popusta i promo-kodovima 
    public ObracunCeneService(SalonKontekst kontekst) 
    { 
        _kontekst = kontekst; 
    } 
 
    // Obracun popusta nad ukupnom cenom u RSD 
    public async Task<ObracunCeneRezultat> IzracunajAsync( 
        decimal ukupnaCenaRsd, 
        string? promoKod) 
    { 
        if (ukupnaCenaRsd < 0) 
        { 
            throw new ArgumentException("Cena ne moze biti negativna."); 
        } 
 
        decimal procenatPopusta = 0; 
        bool promoKodVazi = false; 
 
        var informacije = await _kontekst.OsnovneInformacije 
            .AsNoTracking() 
            .FirstOrDefaultAsync(); 
 
        // Popust 10% vazi do administrativno zadatog datuma 
        if (informacije?.DatumDoKadaVaziPopust != null &&
                DateTime.Today <= informacije.DatumDoKadaVaziPopust.Value.Date)
        {
             procenatPopusta += 10;
        }
 
        if (!string.IsNullOrWhiteSpace(promoKod)) 
        { 
            var kod = promoKod.Trim().ToUpperInvariant(); 
 
            // Promo kod mora postojati i biti dostupan 
            var promo = await _kontekst.PromoKodovi 
                .AsNoTracking() 
                .FirstOrDefaultAsync(p => 
                    p.Kod == kod && 
                    p.Status == StatusPromoKoda.DOSTUPAN); 
 
            if (promo != null) 
            { 
                procenatPopusta += 5; 
                promoKodVazi = true; 
            } 
        } 
 
        var iznosPopusta = Math.Round( 
            ukupnaCenaRsd * procenatPopusta / 100m, 
            2, 
            MidpointRounding.AwayFromZero); 
 
        var konacnaCena = ukupnaCenaRsd - iznosPopusta; 
 
        return new ObracunCeneRezultat 
        { 
            UkupnaCenaRsd = ukupnaCenaRsd, 
            ProcenatPopusta = procenatPopusta, 
            IznosPopustaRsd = iznosPopusta, 
            KonacnaCenaRsd = konacnaCena, 
            PromoKodVazi = promoKodVazi 
        }; 
    } 
} 