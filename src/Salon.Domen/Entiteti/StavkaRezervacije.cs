namespace Salon.Domen.Entiteti;

public class StavkaRezervacije
{
    public int Id { get; set; }

    // Rezervacija kojoj stavka pripada
    public int RezervacijaId { get; set; }
    public Rezervacija Rezervacija { get; set; } = null!;

    // Izabrana usluga
    public int UslugaId { get; set; }
    public Usluga Usluga { get; set; } = null!;

    // Izabrani datum i termin
    public DateTime Datum { get; set; }
    public TimeSpan VremePocetka { get; set; }

    // Cena usluge u trenutku rezervacije
    public decimal Cena { get; set; }
}