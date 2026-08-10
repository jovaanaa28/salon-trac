using Salon.Domen.Enumeracije;

namespace Salon.Domen.Entiteti;

public class PromoKod
{
    public int Id { get; set; }

    // Jedinstveni kod za popust
    public string Kod { get; set; } = string.Empty;

    // Rezervacija na osnovu koje je kod generisan
    public int RezervacijaId { get; set; }
    public Rezervacija Rezervacija { get; set; } = null!;

    // Trenutno stanje promo koda
    public StatusPromoKoda Status { get; set; }
        = StatusPromoKoda.DOSTUPAN;

    // Popunjava se kada se promo kod iskoristi
    public DateTime? DatumKoriscenja { get; set; }
}