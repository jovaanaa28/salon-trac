using Microsoft.EntityFrameworkCore; 
using Salon.Domen.Enumeracije; 
using Salon.Domen.Modeli;
using Salon.Infrastruktura.Podaci; 
 
namespace Salon.Infrastruktura.Servisi; 
 
public class TerminService 
{ 
    private readonly SalonKontekst _kontekst; 
 
    // Pristup podacima o uslugama i rezervacijama 
    public TerminService(SalonKontekst kontekst) 
    { 
        _kontekst = kontekst; 
    } 
 
    // Vracanje samo termina koji imaju slobodna mesta 
    public async Task<List<DostupanTermin>?> VratiDostupneTermineAsync( 
        int uslugaId, 
        DateTime datum) 
    { 
        var usluga = await _kontekst.Usluge 
            .AsNoTracking() 
            .FirstOrDefaultAsync(u => u.Id == uslugaId); 
 
        if (usluga == null) 
        { 
            return null; 
        } 
 
        var rezultat = new List<DostupanTermin>(); 
        var trenutnoVreme = usluga.VremePocetkaPrvogTermina; 
        var trajanje = TimeSpan.FromMinutes(usluga.TrajanjeUMinutima); 
 
        var pocetakDana = datum.Date; 
        var krajDana = pocetakDana.AddDays(1); 
 
        while (trenutnoVreme + trajanje <= 
               usluga.VremeZavrsetkaPoslednjegTermina) 
        { 
            // Broje se samo stavke aktivnih rezervacija 
            var zauzeto = await _kontekst.StavkeRezervacija 
                .AsNoTracking() 
                .CountAsync(s => 
                    s.UslugaId == uslugaId && 
                    s.Datum >= pocetakDana && 
                    s.Datum < krajDana && 
                    s.VremePocetka == trenutnoVreme && 
                    s.Rezervacija.Status == StatusRezervacije.AKTIVNA); 
 
            var dostupnaMesta = 
                usluga.MaksimalanBrojKlijenataPoTerminu - zauzeto; 
 
            if (dostupnaMesta > 0) 
            { 
                rezultat.Add(new DostupanTermin 
                { 
                    Datum = datum.Date, 
                    VremePocetka = trenutnoVreme, 
                    DostupnaMesta = dostupnaMesta 
                }); 
            } 
 
            trenutnoVreme = trenutnoVreme.Add(trajanje); 
        } 
 
        return rezultat; 
    } 
} 