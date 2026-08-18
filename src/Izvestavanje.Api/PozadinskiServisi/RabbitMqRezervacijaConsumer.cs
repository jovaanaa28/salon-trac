using System.Text;
using System.Text.Json;
using Izvestavanje.Api.Servisi;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using Zajednicko.Poruke.Dogadjaji;

namespace Izvestavanje.Api.PozadinskiServisi;

public class RabbitMqRezervacijaConsumer(
    ILogger<RabbitMqRezervacijaConsumer> logger,
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

        var exchangeName =
            configuration["RabbitMq:EventExchangeName"]
            ?? throw new InvalidOperationException(
                "RabbitMq:EventExchangeName nije konfigurisan.");

        var queueName =
            configuration["RabbitMq:EventQueueName"]
            ?? throw new InvalidOperationException(
                "RabbitMq:EventQueueName nije konfigurisan.");

        var port =
            configuration.GetValue<int?>("RabbitMq:Port")
            ?? throw new InvalidOperationException(
                "RabbitMq:Port nije konfigurisan.");

        var factory = new ConnectionFactory
        {
            HostName = hostName,
            Port = port,
            UserName = userName,
            Password = password
        };

        try
        {
            await using var connection =
                await factory.CreateConnectionAsync(
                    stoppingToken);

            await using var channel =
                await connection.CreateChannelAsync(
                    cancellationToken: stoppingToken);

            await channel.ExchangeDeclareAsync(
                exchange: exchangeName,
                type: ExchangeType.Topic,
                durable: true,
                autoDelete: false,
                arguments: null,
                cancellationToken: stoppingToken);

            await channel.QueueDeclareAsync(
                queue: queueName,
                durable: true,
                exclusive: false,
                autoDelete: false,
                arguments: null,
                cancellationToken: stoppingToken);

            await channel.QueueBindAsync(
                queue: queueName,
                exchange: exchangeName,
                routingKey: "rezervacija.#",
                arguments: null,
                cancellationToken: stoppingToken);

            await channel.BasicQosAsync(
                prefetchSize: 0,
                prefetchCount: 1,
                global: false,
                cancellationToken: stoppingToken);

            var consumer =
                new AsyncEventingBasicConsumer(channel);

            consumer.ReceivedAsync += async (_, ea) =>
            {
                try
                {
                    var json =
                        Encoding.UTF8.GetString(
                            ea.Body.ToArray());

                    var dogadjajId =
                        ProcitajDogadjajId(json);

                    using var scope =
                        scopeFactory.CreateScope();

                    var idempotencija =
                        scope.ServiceProvider
                            .GetRequiredService<
                                IdempotencijaDogadjajaService>();

                    var vecObradjen =
                        await idempotencija
                            .JeObradjenAsync(
                                dogadjajId,
                                ea.CancellationToken);

                    if (vecObradjen)
                    {
                        logger.LogInformation(
                            "Dogadjaj {DogadjajId} je vec obradjen. " +
                            "Poruka se preskace.",
                            dogadjajId);

                        await channel.BasicAckAsync(
                            ea.DeliveryTag,
                            multiple: false,
                            cancellationToken:
                                ea.CancellationToken);

                        return;
                    }

                    if (ea.RoutingKey ==
                        "rezervacija.kreirana")
                    {
                        var dogadjaj =
                            JsonSerializer.Deserialize<
                                RezervacijaKreiranaDogadjaj>(
                                json);

                        if (dogadjaj == null)
                        {
                            throw new ArgumentException(
                                "Dogadjaj kreiranja nije validan.");
                        }

                        if (dogadjaj.DogadjajId !=
                            dogadjajId)
                        {
                            throw new ArgumentException(
                                "DogadjajId nije konzistentan.");
                        }

                        var obrada =
                            scope.ServiceProvider
                                .GetRequiredService<
                                    ObradaKreiraneRezervacijeService>();

                        await obrada.ObradiAsync(
                            dogadjaj,
                            ea.CancellationToken);

                        await channel.BasicAckAsync(
                            ea.DeliveryTag,
                            multiple: false,
                            cancellationToken:
                                ea.CancellationToken);

                        logger.LogInformation(
                            "Rezervacija {RezervacijaId} " +
                            "sinhronizovana u A2. " +
                            "Dogadjaj {DogadjajId} je ACK-ovan.",
                            dogadjaj.RezervacijaId,
                            dogadjaj.DogadjajId);

                        return;
                    }

                    if (ea.RoutingKey ==
                        "rezervacija.izmenjena")
                    {
                        var dogadjaj =
                            JsonSerializer.Deserialize<
                                RezervacijaIzmenjenaDogadjaj>(
                                json);

                        if (dogadjaj == null)
                        {
                            throw new ArgumentException(
                                "Dogadjaj izmene nije validan.");
                        }

                        if (dogadjaj.DogadjajId !=
                            dogadjajId)
                        {
                            throw new ArgumentException(
                                "DogadjajId nije konzistentan.");
                        }

                        var obrada =
                            scope.ServiceProvider
                                .GetRequiredService<
                                    ObradaIzmenjeneRezervacijeService>();

                        await obrada.ObradiAsync(
                            dogadjaj,
                            ea.CancellationToken);

                        await channel.BasicAckAsync(
                            ea.DeliveryTag,
                            multiple: false,
                            cancellationToken:
                                ea.CancellationToken);

                        logger.LogInformation(
                            "Izmena rezervacije {RezervacijaId} " +
                            "sinhronizovana u A2. " +
                            "Dogadjaj {DogadjajId} je ACK-ovan.",
                            dogadjaj.RezervacijaId,
                            dogadjaj.DogadjajId);

                        return;
                    }

                    if (ea.RoutingKey ==
                    "rezervacija.otkazana")
                    {
                        var dogadjaj =
                            JsonSerializer.Deserialize<
                                RezervacijaOtkazanaDogadjaj>(
                                json);

                        if (dogadjaj == null)
                        {
                            throw new ArgumentException(
                                "Dogadjaj otkazivanja nije validan.");
                        }

                        if (dogadjaj.DogadjajId !=
                            dogadjajId)
                        {
                            throw new ArgumentException(
                                "DogadjajId nije konzistentan.");
                        }

                        var obrada =
                            scope.ServiceProvider
                                .GetRequiredService<
                                    ObradaOtkazaneRezervacijeService>();

                        await obrada.ObradiAsync(
                            dogadjaj,
                            ea.CancellationToken);

                        await channel.BasicAckAsync(
                            ea.DeliveryTag,
                            multiple: false,
                            cancellationToken:
                                ea.CancellationToken);

                        logger.LogInformation(
                            "Otkazivanje rezervacije {RezervacijaId} " +
                            "sinhronizovano u A2. " +
                            "Dogadjaj {DogadjajId} je ACK-ovan.",
                            dogadjaj.RezervacijaId,
                            dogadjaj.DogadjajId);

                        return;
                    }

                    logger.LogWarning(
                        "Nepodrzan RabbitMQ dogadjaj tipa {RoutingKey}. " +
                        "Poruka se odbacuje.",
                        ea.RoutingKey);

                    await channel.BasicNackAsync(
                        ea.DeliveryTag,
                        multiple: false,
                        requeue: false,
                        cancellationToken:
                            ea.CancellationToken);
                }
                catch (JsonException ex)
                {
                    logger.LogWarning(
                        ex,
                        "RabbitMQ poruka nije validan JSON.");

                    await channel.BasicNackAsync(
                        ea.DeliveryTag,
                        multiple: false,
                        requeue: false,
                        cancellationToken:
                            ea.CancellationToken);
                }
                catch (ArgumentException ex)
                {
                    logger.LogWarning(
                        ex,
                        "RabbitMQ dogadjaj nije validan.");

                    await channel.BasicNackAsync(
                        ea.DeliveryTag,
                        multiple: false,
                        requeue: false,
                        cancellationToken:
                            ea.CancellationToken);
                }
                catch (Exception ex)
                {
                    logger.LogError(
                        ex,
                        "Greska tokom obrade RabbitMQ dogadjaja.");

                    // Poruka se ne ACK-uje.
                    // Nakon zatvaranja konekcije RabbitMQ
                    // ce je ponovo ponuditi consumer-u.
                }
            };

            await channel.BasicConsumeAsync(
                queue: queueName,
                autoAck: false,
                consumer: consumer,
                cancellationToken: stoppingToken);

            logger.LogInformation(
                "A2 RabbitMQ consumer je pokrenut. " +
                "Exchange: {Exchange}, Queue: {Queue}, " +
                "Binding: rezervacija.#",
                exchangeName,
                queueName);

            await Task.Delay(
                Timeout.Infinite,
                stoppingToken);
        }
        catch (OperationCanceledException)
            when (stoppingToken.IsCancellationRequested)
        {
            logger.LogInformation(
                "A2 RabbitMQ consumer je zaustavljen.");
        }
    }

    private static Guid ProcitajDogadjajId(
        string json)
    {
        using var dokument =
            JsonDocument.Parse(json);

        if (!dokument.RootElement.TryGetProperty(
                "DogadjajId",
                out var dogadjajIdElement))
        {
            throw new ArgumentException(
                "Dogadjaj nema polje DogadjajId.");
        }

        if (dogadjajIdElement.ValueKind !=
            JsonValueKind.String)
        {
            throw new ArgumentException(
                "DogadjajId nije ispravnog tipa.");
        }

        if (!Guid.TryParse(
                dogadjajIdElement.GetString(),
                out var dogadjajId))
        {
            throw new ArgumentException(
                "DogadjajId nije validan GUID.");
        }

        if (dogadjajId == Guid.Empty)
        {
            throw new ArgumentException(
                "DogadjajId ne sme biti prazan.");
        }

        return dogadjajId;
    }
}