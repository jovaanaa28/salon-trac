using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using Salon.Domen.Enumeracije;
using Salon.Infrastruktura.Podaci;
using Salon.Infrastruktura.Servisi;
using Zajednicko.Poruke.Komande;

namespace Salon.Radnik;

public class Worker(
    ILogger<Worker> logger,
    IConfiguration configuration,
    IServiceScopeFactory scopeFactory)
    : BackgroundService
{
    protected override async Task ExecuteAsync(
        CancellationToken stoppingToken)
    {
        var hostName = configuration["RabbitMq:HostName"]
            ?? throw new InvalidOperationException(
                "RabbitMq:HostName nije konfigurisan.");

        var userName = configuration["RabbitMq:UserName"]
            ?? throw new InvalidOperationException(
                "RabbitMq:UserName nije konfigurisan.");

        var password = configuration["RabbitMq:Password"]
            ?? throw new InvalidOperationException(
                "RabbitMq:Password nije konfigurisan.");

        var queueName = configuration["RabbitMq:QueueName"]
            ?? throw new InvalidOperationException(
                "RabbitMq:QueueName nije konfigurisan.");

        var port =
            configuration.GetValue<int>("RabbitMq:Port");

        var factory = new ConnectionFactory
        {
            HostName = hostName,
            Port = port,
            UserName = userName,
            Password = password
        };

        await using var connection =
            await factory.CreateConnectionAsync(stoppingToken);

        await using var channel =
            await connection.CreateChannelAsync(
                cancellationToken: stoppingToken);

        // Isti queue koji koristi Salon.Api
        await channel.QueueDeclareAsync(
            queue: queueName,
            durable: true,
            exclusive: false,
            autoDelete: false,
            arguments: null,
            cancellationToken: stoppingToken);

        // Worker obradjuje jednu poruku pre uzimanja sledece
        await channel.BasicQosAsync(
            prefetchSize: 0,
            prefetchCount: 1,
            global: false,
            cancellationToken: stoppingToken);

        var consumer =
            new AsyncEventingBasicConsumer(channel);

        consumer.ReceivedAsync += async (_, ea) =>
        {
            var body = ea.Body.ToArray();

            KreirajRezervacijuKomanda? komanda = null;

            try
            {
                var json =
                    Encoding.UTF8.GetString(body);

                komanda =
                    JsonSerializer.Deserialize<
                        KreirajRezervacijuKomanda>(json);

                if (komanda == null)
                {
                    throw new ArgumentException(
                        "RabbitMQ poruka nije validna.");
                }

                // Worker je preuzeo zahtev
                await AzurirajStatusAsync(
                    komanda.IdZahteva,
                    StatusObradeRezervacije.U_OBRADI,
                    "Zahtev se trenutno obradjuje.",
                    null,
                    ea.CancellationToken);

                int rezervacijaId;

                // Poseban scope za samu obradu rezervacije
                using (var scope = scopeFactory.CreateScope())
                {
                    var obrada =
                        scope.ServiceProvider
                            .GetRequiredService<
                                ObradaRezervacijeService>();

                    rezervacijaId =
                        await obrada.ObradiAsync(
                            komanda,
                            ea.CancellationToken);
                }

            try
            {
                using var eventScope = scopeFactory.CreateScope();

                var dogadjaji = eventScope.ServiceProvider
                    .GetRequiredService<RezervacijaDogadjajService>();

                await dogadjaji.PosaljiKreiranaAsync(
                    rezervacijaId,
                    ea.CancellationToken);
            }
            catch (Exception eventEx)
            {
                logger.LogError(
                    eventEx,
                    "Rezervacija {RezervacijaId} je sacuvana, ali dogadjaj nije objavljen.",
                    rezervacijaId);
            }

                // Uspesna obrada
                await AzurirajStatusAsync(
                    komanda.IdZahteva,
                    StatusObradeRezervacije.USPESNA,
                    "Rezervacija je uspesno kreirana.",
                    rezervacijaId,
                    ea.CancellationToken);

                await channel.BasicAckAsync(
                    ea.DeliveryTag,
                    multiple: false,
                    cancellationToken:
                        ea.CancellationToken);

                logger.LogInformation(
                    "Rezervacija uspesno obradjena. Id zahteva: {IdZahteva}",
                    komanda.IdZahteva);
            }
            catch (ArgumentException ex)
            {
                if (komanda != null)
                {
                    await AzurirajStatusAsync(
                        komanda.IdZahteva,
                        StatusObradeRezervacije.ODBIJENA,
                        ex.Message,
                        null,
                        ea.CancellationToken);
                }

                logger.LogWarning(
                    "Rezervacija je odbijena: {Poruka}",
                    ex.Message);

                await channel.BasicAckAsync(
                    ea.DeliveryTag,
                    multiple: false,
                    cancellationToken:
                        ea.CancellationToken);
            }
            catch (Exception ex)
            {
                if (komanda != null)
                {
                    try
                    {
                        await AzurirajStatusAsync(
                            komanda.IdZahteva,
                            StatusObradeRezervacije.ODBIJENA,
                            "Doslo je do greske tokom obrade zahteva.",
                            null,
                            ea.CancellationToken);
                    }
                    catch (Exception statusEx)
                    {
                        logger.LogError(
                            statusEx,
                            "Status zahteva nije mogao biti azuriran.");
                    }
                }

                logger.LogError(
                    ex,
                    "Greska tokom obrade RabbitMQ poruke.");

                await channel.BasicNackAsync(
                    ea.DeliveryTag,
                    multiple: false,
                    requeue: false,
                    cancellationToken:
                        ea.CancellationToken);
            }
        };

        await channel.BasicConsumeAsync(
            queue: queueName,
            autoAck: false,
            consumer: consumer,
            cancellationToken: stoppingToken);

        logger.LogInformation(
            "Worker slusa RabbitMQ queue: {QueueName}",
            queueName);

        try
        {
            await Task.Delay(
                Timeout.Infinite,
                stoppingToken);
        }
        catch (OperationCanceledException)
        {
            // Normalno gasenje Worker-a
        }
    }

    // Promena statusa zahteva koristi poseban DbContext
    private async Task AzurirajStatusAsync(
        Guid idZahteva,
        StatusObradeRezervacije status,
        string poruka,
        int? rezervacijaId,
        CancellationToken cancellationToken)
    {
        using var scope = scopeFactory.CreateScope();

        var kontekst =
            scope.ServiceProvider
                .GetRequiredService<SalonKontekst>();

        var zahtev =
            await kontekst.ZahteviZaRezervaciju
                .FirstOrDefaultAsync(
                    z => z.IdZahteva == idZahteva,
                    cancellationToken);

        if (zahtev == null)
        {
            logger.LogWarning(
                "Status za zahtev {IdZahteva} nije pronadjen.",
                idZahteva);

            return;
        }

        zahtev.Status = status;
        zahtev.Poruka = poruka;
        zahtev.RezervacijaId = rezervacijaId;
        zahtev.DatumIzmene = DateTime.UtcNow;

        await kontekst.SaveChangesAsync(
            cancellationToken);
    }
}
