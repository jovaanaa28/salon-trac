using System;
using System.Collections.Generic;

namespace Zajednicko.Poruke.Dogadjaji;

public class RezervacijaIzmenjenaDogadjaj
{
    public Guid DogadjajId { get; set; } = Guid.NewGuid();
    public int RezervacijaId { get; set; }
    public DateTime VremeDogadjaja { get; set; } = DateTime.UtcNow;
    public string VrstaIzmene { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string IzabranaValuta { get; set; } = string.Empty;
    public decimal UkupnaCena { get; set; }
    public decimal Popust { get; set; }
    public decimal KonacnaCena { get; set; }
    public List<StavkaRezervacijeDogadjaj> Stavke { get; set; } = new List<StavkaRezervacijeDogadjaj>();
}