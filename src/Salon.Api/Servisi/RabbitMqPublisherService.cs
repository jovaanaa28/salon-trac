using System.Text;
using System.Text.Json;
using RabbitMQ.Client;
using Zajednicko.Poruke.Komande;

namespace Salon.Api.Servisi;

public class RabbitMqPublisherService
{
    private readonly IConfiguration _configuration;

    public RabbitMqPublisherService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    // Slanje komande za kreiranje rezervacije u RabbitMQ
    public async Task PosaljiKreiranjeRezervacijeAsync(
        KreirajRezervacijuKomanda komanda,
        CancellationToken cancellationToken = default)
    {
        var hostName = _configuration["RabbitMq:HostName"]
            ?? throw new InvalidOperationException(
                "RabbitMq:HostName nije konfigurisan.");

        var userName = _configuration["RabbitMq:UserName"]
            ?? throw new InvalidOperationException(
                "RabbitMq:UserName nije konfigurisan.");

        var password = _configuration["RabbitMq:Password"]
            ?? throw new InvalidOperationException(
                "RabbitMq:Password nije konfigurisan.");

        var queueName = _configuration["RabbitMq:QueueName"]
            ?? throw new InvalidOperationException(
                "RabbitMq:QueueName nije konfigurisan.");

        var port = _configuration.GetValue<int>("RabbitMq:Port");

        var factory = new ConnectionFactory
        {
            HostName = hostName,
            Port = port,
            UserName = userName,
            Password = password
        };

        await using var connection =
            await factory.CreateConnectionAsync(cancellationToken);

        await using var channel =
            await connection.CreateChannelAsync(
                cancellationToken: cancellationToken);

        // Queue ostaje sacuvan i nakon restarta RabbitMQ-a
        await channel.QueueDeclareAsync(
            queue: queueName,
            durable: true,
            exclusive: false,
            autoDelete: false,
            arguments: null,
            cancellationToken: cancellationToken);

        var json = JsonSerializer.Serialize(komanda);
        var body = Encoding.UTF8.GetBytes(json);

        var properties = new BasicProperties
        {
            ContentType = "application/json",
            Persistent = true,
            MessageId = komanda.IdZahteva.ToString()
        };

        // Slanje poruke u queue
        await channel.BasicPublishAsync(
            exchange: string.Empty,
            routingKey: queueName,
            mandatory: true,
            basicProperties: properties,
            body: body,
            cancellationToken: cancellationToken);
    }
}