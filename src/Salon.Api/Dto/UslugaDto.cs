using System.ComponentModel.DataAnnotations;

namespace Salon.Api.Dto;

public class UslugaDto
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Naziv usluge je obavezan.")]
    public string Naziv { get; set; } = string.Empty;

    [Required(ErrorMessage = "Opis usluge je obavezan.")]
    public string Opis { get; set; } = string.Empty;

    [Range(1, int.MaxValue, ErrorMessage = "Trajanje mora biti vece od 0.")]
    public int TrajanjeUMinutima { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Maksimalan broj klijenata mora biti veci od 0.")]
    public int MaksimalanBrojKlijenataPoTerminu { get; set; }

    public TimeSpan VremePocetkaPrvogTermina { get; set; }

    public TimeSpan VremeZavrsetkaPoslednjegTermina { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Cena ne moze biti negativna.")]
    public decimal Cena { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Kategorija je obavezna.")]
    public int KategorijaUslugeId { get; set; }

    public string? KategorijaNaziv { get; set; }
}