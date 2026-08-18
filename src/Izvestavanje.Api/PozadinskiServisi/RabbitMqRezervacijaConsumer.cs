using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace Izvestavanje.Api.PozadinskiServisi;

public class RabbitMqRezervacijaConsumer(
    ILogger<RabbitMqRezervacijaConsumer> logger,
    IConfiguration configuration)
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
                await factory.CreateConnectionAsync(stoppingToken);

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

            // Dok ne uvedemo pravu obradu, uzimamo najvise
            // jednu poruku iz queue-a.
            await channel.BasicQosAsync(
                prefetchSize: 0,
                prefetchCount: 1,
                global: false,
                cancellationToken: stoppingToken);

            var consumer =
                new AsyncEventingBasicConsumer(channel);

            consumer.ReceivedAsync += (_, ea) =>
            {
                logger.LogInformation(
                    "Primljen RabbitMQ dogadjaj {RoutingKey}. " +
                    "Obrada poruke bice dodata u narednim taskovima.",
                    ea.RoutingKey);

                // TASK 49:
                // Namerno nema ACK-a.
                // Poruka ostaje neobradjena i vratice se u queue
                // kada se konekcija zatvori.
                return Task.CompletedTask;
            };

            await channel.BasicConsumeAsync(
                queue: queueName,
                autoAck: false,
                consumer: consumer,
                cancellationToken: stoppingToken);

            logger.LogInformation(
                "A2 RabbitMQ consumer je pokrenut. " +
                "Exchange: {Exchange}, Queue: {Queue}, Binding: rezervacija.#",
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
}