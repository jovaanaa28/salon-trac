using System.ComponentModel.DataAnnotations;

namespace Salon.Api.Dto;

public class DodajStavkuRezervacijeDto
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Sifra { get; set; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int UslugaId { get; set; }

    public DateTime Datum { get; set; }
    public TimeSpan VremePocetka { get; set; }
}