using System.ComponentModel.DataAnnotations;

namespace Salon.Api.Dto;

public class OsnovneInformacijeDto
{
    [Required(ErrorMessage = "Naziv je obavezan.")]
    public string Naziv { get; set; } = string.Empty;

    [Required(ErrorMessage = "Lokacija je obavezna.")]
    public string Lokacija { get; set; } = string.Empty;

    [Required(ErrorMessage = "Opis je obavezan.")]
    public string Opis { get; set; } = string.Empty;

    [Required(ErrorMessage = "Radno vreme je obavezno.")]
    public string RadnoVreme { get; set; } = string.Empty;
}