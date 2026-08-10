namespace Salon.Domen.Entiteti;

public class Usluga
{
    public int Id { get; set; }

    public string Naziv { get; set; } = string.Empty;

    public string Opis { get; set; } = string.Empty;

    public int TrajanjeUMinutima { get; set; }

    public int MaksimalanBrojKlijenataPoTerminu { get; set; }

    public TimeSpan VremePocetkaPrvogTermina { get; set; }

    public TimeSpan VremeZavrsetkaPoslednjegTermina { get; set; }

    public decimal Cena { get; set; }

    public int KategorijaUslugeId { get; set; }

    public KategorijaUsluge KategorijaUsluge { get; set; } = null!;
}

