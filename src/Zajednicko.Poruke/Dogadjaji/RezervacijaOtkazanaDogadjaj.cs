namespace Zajednicko.Poruke.Dogadjaji; 

public class RezervacijaOtkazanaDogadjaj
{
    public Guid DogadjajId { get; set; } = Guid.NewGuid();
    public int RezervacijaId { get; set; }
    public DateTime VremeDogadjaja { get; set; } = DateTime.UtcNow;
    public string Email { get; set; } = string.Empty;
    public string Status { get; set; } = "OTKAZANA";
    public DateTime DatumOtkazivanja { get; set; }
}