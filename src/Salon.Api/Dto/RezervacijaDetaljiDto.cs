namespace Salon.Api.Dto;

public class StavkaRezervacijeDetaljiDto
{
    public int Id { get; set; }
    public int UslugaId { get; set; }
    public string NazivUsluge { get; set; } = string.Empty;

    public DateTime Datum { get; set; }
    public TimeSpan VremePocetka { get; set; }

    public decimal CenaRsd { get; set; }
}

public class RezervacijaDetaljiDto
{
    public int Id { get; set; }

    public string Ime { get; set; } = string.Empty;
    public string Prezime { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public string IzabranaValuta { get; set; } = string.Empty;

    public decimal UkupnaCena { get; set; }
    public decimal Popust { get; set; }
    public decimal KonacnaCena { get; set; }
    public decimal Kurs { get; set; }

    public DateTime DatumKreiranja { get; set; }
    public DateTime? DatumOtkazivanja { get; set; }

    public string? PromoKod { get; set; }

    public List<StavkaRezervacijeDetaljiDto> Stavke { get; set; } = [];
}