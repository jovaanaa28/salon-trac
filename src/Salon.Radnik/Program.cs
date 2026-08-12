using Microsoft.EntityFrameworkCore;
using Salon.Infrastruktura.Podaci;
using Salon.Infrastruktura.Servisi;
using Salon.Radnik;

var builder = Host.CreateApplicationBuilder(args);

// Konekcija Worker-a ka MariaDB bazi
var connectionString =
    builder.Configuration.GetConnectionString("SalonBaza")
    ?? throw new InvalidOperationException(
        "Connection string 'SalonBaza' nije konfigurisan.");

builder.Services.AddDbContext<SalonKontekst>(options =>
    options.UseMySql(
        connectionString,
        ServerVersion.AutoDetect(connectionString)));

// Servisi potrebni za konacnu obradu rezervacije
builder.Services.AddScoped<ObracunCeneService>();
builder.Services.AddScoped<GeneratorKodovaService>();
builder.Services.AddScoped<ObradaRezervacijeService>();

// Otvoreni API za kurs
builder.Services.AddHttpClient<KursService>(client =>
{
    client.BaseAddress =
        new Uri("https://api.frankfurter.dev/v2/");

    client.Timeout = TimeSpan.FromSeconds(10);
});

// Background Worker
builder.Services.AddHostedService<Worker>();

var host = builder.Build();

host.Run();