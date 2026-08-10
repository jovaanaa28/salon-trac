namespace Salon.Domen.Entiteti;

public class OsnovneInformacije
{
    public int Id { get; set; }

    public string Naziv { get; set; } = string.Empty;

    public string Lokacija { get; set; } = string.Empty;

    public string Opis { get; set; } = string.Empty;

    public string RadnoVreme { get; set; } = string.Empty;

    public DateTime? DatumDoKadaVaziPopust { get; set; }
}