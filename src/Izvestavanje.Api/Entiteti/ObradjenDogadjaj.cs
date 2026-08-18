namespace Izvestavanje.Api.Entiteti;

public class ObradjenDogadjaj
{
    public int Id { get; set; }

    public Guid DogadjajId { get; set; }

    public DateTime VremeObrade { get; set; } = DateTime.UtcNow;

    public string TipDogadjaja { get; set; } = string.Empty;
}