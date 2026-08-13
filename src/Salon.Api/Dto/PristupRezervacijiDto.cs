using System.ComponentModel.DataAnnotations;

namespace Salon.Api.Dto;

public class PristupRezervacijiDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Sifra { get; set; } = string.Empty;
}