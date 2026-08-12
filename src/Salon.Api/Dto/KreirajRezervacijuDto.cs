using System.ComponentModel.DataAnnotations;

namespace Salon.Api.Dto;

public class KreirajRezervacijuDto
{
    [Required]
    public string Ime { get; set; } = string.Empty;

    [Required]
    public string Prezime { get; set; } = string.Empty;

    [Required]
    public string Adresa { get; set; } = string.Empty;

    [Required]
    public string PostanskiBroj { get; set; } = string.Empty;

    [Required]
    public string Mesto { get; set; } = string.Empty;

    [Required]
    public string Drzava { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string IzabranaValuta { get; set; } = string.Empty;

    public string? PromoKod { get; set; }

    [MinLength(1)]
    public List<StavkaRezervacijeDto> Stavke { get; set; } = [];
}

public class StavkaRezervacijeDto
{
    [Range(1, int.MaxValue)]
    public int UslugaId { get; set; }

    public DateTime Datum { get; set; }

    public TimeSpan VremePocetka { get; set; }
}