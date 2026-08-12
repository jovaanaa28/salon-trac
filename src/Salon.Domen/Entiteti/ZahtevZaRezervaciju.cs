using Salon.Domen.Enumeracije;

namespace Salon.Domen.Entiteti;

public class ZahtevZaRezervaciju
{
    public int Id { get; set; }

    // Identifikator koji API vraca korisniku
    public Guid IdZahteva { get; set; }

    // Trenutni status asinhrone obrade
    public StatusObradeRezervacije Status { get; set; }
        = StatusObradeRezervacije.NA_CEKANJU;

    public string Poruka { get; set; } = string.Empty;

    // Popunjava se samo ako je rezervacija uspesno kreirana
    public int? RezervacijaId { get; set; }
    public Rezervacija? Rezervacija { get; set; }

    public DateTime DatumKreiranja { get; set; } = DateTime.UtcNow;
    public DateTime DatumIzmene { get; set; } = DateTime.UtcNow;
}