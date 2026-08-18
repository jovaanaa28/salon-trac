using Izvestavanje.Api.Podaci;
using Izvestavanje.Api.PozadinskiServisi;
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

// A2 slusa dogadjaje o rezervacijama iz RabbitMQ-a
builder.Services.AddHostedService<RabbitMqRezervacijaConsumer>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();