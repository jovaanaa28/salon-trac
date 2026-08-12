namespace Zajednicko.Poruke.Komande;

public class KreirajRezervacijuKomanda
{
    // Identifikator zahteva za pracenje obrade
    public Guid IdZahteva { get; set; }

    // Podaci korisnika
    public string Ime { get; set; } = string.Empty;
    public string Prezime { get; set; } = string.Empty;
    public string Adresa { get; set; } = string.Empty;
    public string PostanskiBroj { get; set; } = string.Empty;
    public string Mesto { get; set; } = string.Empty;
    public string Drzava { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

    // Izabrana valuta i opcioni promo-kod
    public string IzabranaValuta { get; set; } = string.Empty;
    public string? PromoKod { get; set; }

    // Izabrane usluge i termini
    public List<StavkaRezervacijeKomanda> Stavke { get; set; } = [];
}

public class StavkaRezervacijeKomanda
{
    public int UslugaId { get; set; }

    public DateTime Datum { get; set; }

    public TimeSpan VremePocetka { get; set; }
}