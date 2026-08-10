using Microsoft.EntityFrameworkCore;
using Salon.Domen.Entiteti;

namespace Salon.Infrastruktura.Podaci;

public class SalonKontekst : DbContext
{
    public SalonKontekst(DbContextOptions<SalonKontekst> options)
        : base(options)
    {
    }

    public DbSet<OsnovneInformacije> OsnovneInformacije { get; set; }

    public DbSet<KategorijaUsluge> KategorijeUsluga { get; set; }

    public DbSet<Usluga> Usluge { get; set; }

    public DbSet<DozvoljenaValuta> DozvoljeneValute { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Usluga>()
            .Property(u => u.Cena)
            .HasPrecision(10, 2);
    }
}