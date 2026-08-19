namespace Izvestavanje.Api.Dto;

public class TerminiPoKategorijiDto
{
    public int KategorijaUslugeId { get; set; }

    public string NazivKategorije { get; set; } = string.Empty;

    public int BrojRezervisanihTermina { get; set; }
}