using Salon.Api.Servisi;
using Microsoft.EntityFrameworkCore;
using Salon.Infrastruktura.Podaci;
using Salon.Infrastruktura.Servisi;

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

// Poslovna logika termina
builder.Services.AddScoped<TerminService>();

// Obracun popusta i cene
builder.Services.AddScoped<ObracunCeneService>();

// Generisanje sifre rezervacije i promo-koda
builder.Services.AddScoped<GeneratorKodovaService>();

// Upravljanje rezervacijama (dodavanje stavki, pristup)
builder.Services.AddScoped<UpravljanjeRezervacijomService>();

// Slanje komandi u RabbitMQ
builder.Services.AddScoped<RabbitMqPublisherService>();

// Otvoreni API za devizni kurs
builder.Services.AddHttpClient<KursService>(client =>
{
    client.BaseAddress = new Uri("https://api.frankfurter.dev/v2/");
    client.Timeout = TimeSpan.FromSeconds(10);
});

// Salon.Api/Program.cs 
builder.Services.AddScoped<UpravljanjeRezervacijomService>(); 

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
