namespace Izvestavanje.Api.Entiteti;

public class IzvestajnaStavkaRezervacije
{
    public int Id { get; set; }

    public int IzvestajnaRezervacijaId { get; set; }

    public IzvestajnaRezervacija IzvestajnaRezervacija { get; set; } = null!;

    public int UslugaId { get; set; }

    public int KategorijaUslugeId { get; set; }

    public string NazivKategorije { get; set; } = string.Empty;

    public DateTime Datum { get; set; }

    public TimeSpan VremePocetka { get; set; }
}