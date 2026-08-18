namespace Izvestavanje.Api.Entiteti;

public class IzvestajnaRezervacija
{
    public int Id { get; set; }

    public int RezervacijaIdA1 { get; set; }

    public DateTime DatumKreiranja { get; set; }

    public string Status { get; set; } = string.Empty;

    public List<IzvestajnaStavkaRezervacije> Stavke { get; set; } = [];
}