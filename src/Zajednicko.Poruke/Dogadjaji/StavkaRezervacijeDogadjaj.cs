namespace Zajednicko.Poruke.Dogadjaji; 
 
public class StavkaRezervacijeDogadjaj 
{ 
    public int UslugaId { get; set; } 

    public int KategorijaUslugeId { get; set; }

    public string NazivKategorije { get; set; } = string.Empty;
    
    public DateTime Datum { get; set; } 
    public TimeSpan VremePocetka { get; set; } 
    public decimal CenaRsd { get; set; } 
} 
 
