using Microsoft.EntityFrameworkCore;
using Salon.Infrastruktura.Podaci;

var builder = WebApplication.CreateBuilder(args);

// Ucitavanje konekcije ka bazi
var connectionString = builder.Configuration.GetConnectionString("SalonBaza")
    ?? throw new InvalidOperationException(
        "Connection string 'SalonBaza' nije konfigurisan.");

// Povezivanje Entity Framework-a sa MariaDB bazom
builder.Services.AddDbContext<SalonKontekst>(options =>
    options.UseMySql(
        connectionString,
        ServerVersion.AutoDetect(connectionString)));

// Povezivanje aplikacije sa Redis cache-om
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration =
        builder.Configuration.GetConnectionString("Redis");

    options.InstanceName = "SalonTrac:";
});

// Registracija kontrolera
builder.Services.AddControllers();

// OpenAPI dokumentacija
builder.Services.AddOpenApi();

var app = builder.Build();

// OpenAPI je dostupan u razvojnom okruzenju
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseAuthorization();

// Povezivanje API ruta sa kontrolerima
app.MapControllers();

app.Run();