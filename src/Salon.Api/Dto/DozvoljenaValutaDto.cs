using System.ComponentModel.DataAnnotations;

namespace Salon.Api.Dto;

public class DozvoljenaValutaDto
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Oznaka valute je obavezna.")]
    [StringLength(3, MinimumLength = 3,
        ErrorMessage = "Oznaka valute mora imati 3 slova.")]
    public string Oznaka { get; set; } = string.Empty;

    [Required(ErrorMessage = "Naziv valute je obavezan.")]
    public string Naziv { get; set; } = string.Empty;
}