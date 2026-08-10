using System.ComponentModel.DataAnnotations;

namespace Salon.Api.Dto;

public class KategorijaUslugeDto
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Naziv kategorije je obavezan.")]
    public string Naziv { get; set; } = string.Empty;
}