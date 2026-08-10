using Microsoft.EntityFrameworkCore;
using Salon.Domen.Entiteti;

namespace Salon.Infrastruktura.Podaci;

public class SalonKontekst : DbContext
{
    public SalonKontekst(DbContextOptions<SalonKontekst> options)
        : base(options)
    {
    }

    // Tabele aplikacije
    public DbSet<OsnovneInformacije> OsnovneInformacije { get; set; }
    public DbSet<KategorijaUsluge> KategorijeUsluga { get; set; }
    public DbSet<Usluga> Usluge { get; set; }
    public DbSet<DozvoljenaValuta> DozvoljeneValute { get; set; }
    public DbSet<Rezervacija> Rezervacije { get; set; }
    public DbSet<StavkaRezervacije> StavkeRezervacija { get; set; }
    public DbSet<PromoKod> PromoKodovi { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Preciznost cene usluge
        modelBuilder.Entity<Usluga>()
            .Property(u => u.Cena)
            .HasPrecision(10, 2);

        // Sifra rezervacije mora biti jedinstvena
        modelBuilder.Entity<Rezervacija>()
            .HasIndex(r => r.Sifra)
            .IsUnique();

        // Status rezervacije se u bazi cuva kao tekst
        modelBuilder.Entity<Rezervacija>()
            .Property(r => r.Status)
            .HasConversion<string>();

        // Oznaka valute, npr. RSD ili EUR
        modelBuilder.Entity<Rezervacija>()
            .Property(r => r.IzabranaValuta)
            .HasMaxLength(3);

        // Preciznost novcanih vrednosti rezervacije
        modelBuilder.Entity<Rezervacija>()
            .Property(r => r.UkupnaCena)
            .HasPrecision(12, 2);

        modelBuilder.Entity<Rezervacija>()
            .Property(r => r.Popust)
            .HasPrecision(5, 2);

        modelBuilder.Entity<Rezervacija>()
            .Property(r => r.KonacnaCena)
            .HasPrecision(12, 2);

        modelBuilder.Entity<Rezervacija>()
            .Property(r => r.Kurs)
            .HasPrecision(18, 6);

        // Preciznost cene u stavci rezervacije
        modelBuilder.Entity<StavkaRezervacije>()
            .Property(s => s.Cena)
            .HasPrecision(12, 2);

        // Veza rezervacije sa njenim stavkama
        modelBuilder.Entity<StavkaRezervacije>()
            .HasOne(s => s.Rezervacija)
            .WithMany()
            .HasForeignKey(s => s.RezervacijaId)
            .OnDelete(DeleteBehavior.Cascade);

        // Veza stavke sa uslugom
        modelBuilder.Entity<StavkaRezervacije>()
            .HasOne(s => s.Usluga)
            .WithMany()
            .HasForeignKey(s => s.UslugaId)
            .OnDelete(DeleteBehavior.Restrict);

        // Promo kod mora biti jedinstven
    modelBuilder.Entity<PromoKod>()
        .HasIndex(p => p.Kod)
        .IsUnique();

    // Jedna rezervacija ima jedan promo kod
    modelBuilder.Entity<PromoKod>()
        .HasIndex(p => p.RezervacijaId)
        .IsUnique();

    // Status promo koda se u bazi cuva kao tekst
    modelBuilder.Entity<PromoKod>()
        .Property(p => p.Status)
        .HasConversion<string>();

    // Veza promo koda sa rezervacijom
    modelBuilder.Entity<PromoKod>()
        .HasOne(p => p.Rezervacija)
        .WithOne()
        .HasForeignKey<PromoKod>(p => p.RezervacijaId)
        .OnDelete(DeleteBehavior.Cascade);
        }
}