using Salon.Domen.Enumeracije;

namespace Salon.Domen.Entiteti;

public class Rezervacija
{
    public int Id { get; set; }

    // Licni podaci korisnika
    public string Ime { get; set; } = string.Empty;
    public string Prezime { get; set; } = string.Empty;
    public string Adresa { get; set; } = string.Empty;
    public string PostanskiBroj { get; set; } = string.Empty;
    public string Mesto { get; set; } = string.Empty;
    public string Drzava { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

    // Podaci za pristup i status rezervacije
    public string Sifra { get; set; } = string.Empty;
    public StatusRezervacije Status { get; set; }
        = StatusRezervacije.AKTIVNA;

    // Podaci za obracun cene
    public string IzabranaValuta { get; set; } = string.Empty;
    public decimal UkupnaCena { get; set; }
    public decimal Popust { get; set; }
    public decimal KonacnaCena { get; set; }
    public decimal Kurs { get; set; }

    // Vreme kreiranja i eventualnog otkazivanja
    public DateTime DatumKreiranja { get; set; } = DateTime.UtcNow;
    public DateTime? DatumOtkazivanja { get; set; }
}