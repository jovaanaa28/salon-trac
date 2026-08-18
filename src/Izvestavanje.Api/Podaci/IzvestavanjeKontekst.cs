using Izvestavanje.Api.Entiteti;
using Microsoft.EntityFrameworkCore;

namespace Izvestavanje.Api.Podaci;

public class IzvestavanjeKontekst : DbContext
{
    public IzvestavanjeKontekst(
        DbContextOptions<IzvestavanjeKontekst> options)
        : base(options)
    {
    }

    public DbSet<IzvestajnaRezervacija> Rezervacije =>
        Set<IzvestajnaRezervacija>();

    public DbSet<IzvestajnaStavkaRezervacije> StavkeRezervacija =>
        Set<IzvestajnaStavkaRezervacije>();

    public DbSet<ObradjenDogadjaj> ObradjeniDogadjaji =>
        Set<ObradjenDogadjaj>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<IzvestajnaRezervacija>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.HasIndex(x => x.RezervacijaIdA1)
                .IsUnique();

            entity.Property(x => x.Status)
                .HasMaxLength(30)
                .IsRequired();

            entity.HasMany(x => x.Stavke)
                .WithOne(x => x.IzvestajnaRezervacija)
                .HasForeignKey(x => x.IzvestajnaRezervacijaId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<IzvestajnaStavkaRezervacije>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.NazivKategorije)
                .HasMaxLength(200)
                .IsRequired();

            entity.HasIndex(x => x.KategorijaUslugeId);
        });

        modelBuilder.Entity<ObradjenDogadjaj>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.HasIndex(x => x.DogadjajId)
                .IsUnique();

            entity.Property(x => x.TipDogadjaja)
                .HasMaxLength(100)
                .IsRequired();
        });
    }
}