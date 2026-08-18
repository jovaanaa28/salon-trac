using Izvestavanje.Api.Podaci;
using Izvestavanje.Api.PozadinskiServisi;
using Izvestavanje.Api.Servisi;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var connectionString =
    builder.Configuration.GetConnectionString("IzvestavanjeBaza")
    ?? throw new InvalidOperationException(
        "Connection string 'IzvestavanjeBaza' nije konfigurisan.");

builder.Services.AddDbContext<IzvestavanjeKontekst>(options =>
    options.UseMySql(
        connectionString,
        ServerVersion.AutoDetect(connectionString)));

builder.Services.AddControllers();

builder.Services.AddOpenApi();

builder.Services.AddScoped<IdempotencijaDogadjajaService>();

builder.Services.AddScoped<
    ObradaKreiraneRezervacijeService>();

builder.Services.AddHostedService<
    RabbitMqRezervacijaConsumer>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();