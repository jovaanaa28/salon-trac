using System.Text; 
using System.Text.Json; 
using Microsoft.Extensions.Configuration; 
using RabbitMQ.Client; 
 
namespace Salon.Infrastruktura.Servisi; 
 
public class RabbitMqDogadjajPublisherService 
{ 
    private readonly IConfiguration _configuration; 
 
    public RabbitMqDogadjajPublisherService(IConfiguration configuration) 
    { 
        _configuration = configuration; 
    } 
 
    public async Task PosaljiAsync<T>( 
        T dogadjaj, 
        string routingKey, 
        CancellationToken cancellationToken = default) 
    { 
        var hostName = _configuration["RabbitMq:HostName"] 
            ?? throw new InvalidOperationException("RabbitMQ host nije konfigurisan."); 
        var userName = _configuration["RabbitMq:UserName"] 
            ?? throw new InvalidOperationException("RabbitMQ user nije konfigurisan."); 
        var password = _configuration["RabbitMq:Password"] 
            ?? throw new InvalidOperationException("RabbitMQ password nije konfigurisan."); 
        var exchangeName = _configuration["RabbitMq:EventExchangeName"] 
            ?? throw new InvalidOperationException("Event exchange nije konfigurisan."); 
        var queueName = _configuration["RabbitMq:EventQueueName"] 
            ?? throw new InvalidOperationException("Event queue nije konfigurisan."); 
        var port = _configuration.GetValue<int>("RabbitMq:Port"); 
 
        var factory = new ConnectionFactory 
        { 
            HostName = hostName, Port = port, 
            UserName = userName, Password = password 
        }; 
 
        await using var connection = await factory 
            .CreateConnectionAsync(cancellationToken); 
        await using var channel = await connection 
            .CreateChannelAsync(cancellationToken: cancellationToken); 
 
        await channel.ExchangeDeclareAsync( 
            exchange: exchangeName, type: ExchangeType.Topic, 
            durable: true, autoDelete: false, arguments: null, 
            cancellationToken: cancellationToken); 
 
        await channel.QueueDeclareAsync( 
            queue: queueName, durable: true, exclusive: false, 
            autoDelete: false, arguments: null, 
            cancellationToken: cancellationToken); 
 
        await channel.QueueBindAsync( 
            queue: queueName, exchange: exchangeName, 
            routingKey: "rezervacija.#", arguments: null, 
            cancellationToken: cancellationToken); 
 
        var body = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(dogadjaj)); 
        var properties = new BasicProperties 
        { 
            ContentType = "application/json", 
            Persistent = true, 
            MessageId = Guid.NewGuid().ToString() 
        }; 
 
        await channel.BasicPublishAsync( 
            exchange: exchangeName, routingKey: routingKey, mandatory: true, 
            basicProperties: properties, body: body, 
            cancellationToken: cancellationToken); 
    } 
} 