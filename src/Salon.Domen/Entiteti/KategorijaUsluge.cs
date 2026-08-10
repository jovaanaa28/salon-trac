namespace Salon.Domen.Entiteti;

public class KategorijaUsluge
{
    public int Id { get; set; }

    public string Naziv { get; set; } = string.Empty;

    public ICollection<Usluga> Usluge { get; set; } = new List<Usluga>();
}