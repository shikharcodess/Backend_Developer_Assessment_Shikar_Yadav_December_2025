import amqp, { Channel, ChannelModel } from "amqplib";
import { ConsumeHandler, PublishOptions } from "../../types/rabbitmq";
import { ENV } from "../../config/env/env";
import { logger } from "../../common/logger";

class _rabbitMQ {
  private connection!: ChannelModel;
  private channel!: Channel;

  private readonly url: string;
  private readonly exchange: string;
  private readonly exchangeType: "direct" | "topic" | "fanout";

  private isConnecting = false;
  private retryDelay = 5000;
  private maxRetries = 10;

  constructor(
    url: string,
    exchange: string,
    exchangeType?: "direct" | "topic" | "fanout"
  ) {
    this.url = url;
    ((this.exchange = exchange), (this.exchangeType = exchangeType || "topic"));
  }

  async connect(retry = 0): Promise<void> {
    if (this.connection || this.isConnecting) return;

    this.isConnecting = true;

    try {
      this.connection = await amqp.connect(this.url);
      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange(this.exchange, this.exchangeType, {
        durable: true,
      });

      this.connection.on("close", () => {
        logger.info("RabbitMQ connection closed. Reconnecting...");
        this.reset();
        this.connect();
      });

      this.connection.on("error", (err) => {
        logger.error("RabbitMQ connection error:", err);
      });

      logger.info("RabbitMQ connected");
    } catch (err) {
      logger.error("RabbitMQ connection failed:", err);

      if (retry < this.maxRetries) {
        await this.delay(this.retryDelay);
        return this.connect(retry + 1);
      }

      throw err;
    } finally {
      this.isConnecting = false;
    }
  }

  private reset() {
    this.connection = undefined as any;
    this.channel = undefined as any;
  }

  private delay(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
  }

  async publish<T>(
    routingKey: string,
    payload: T,
    options: PublishOptions = {}
  ): Promise<void> {
    await this.connect();

    const buffer = Buffer.from(JSON.stringify(payload));

    const published = this.channel.publish(this.exchange, routingKey, buffer, {
      persistent: true,
      contentType: "application/json",
      ...options,
    });

    if (!published) {
      throw new Error("RabbitMQ publish buffer is full");
    }
  }

  async consume<T>(
    queue: string,
    routingKey: string,
    handler: ConsumeHandler<T>
  ): Promise<void> {
    await this.connect();

    await this.channel.assertQueue(queue, {
      durable: true,
    });

    await this.channel.bindQueue(queue, this.exchange, routingKey);

    await this.channel.prefetch(1);

    await this.channel.consume(
      queue,
      async (msg) => {
        if (!msg) return;

        try {
          const content = JSON.parse(msg.content.toString()) as T;
          await handler(content, msg);
          this.channel.ack(msg);
        } catch (err) {
          logger.error("Consumer error:", err);

          /**
           * Requeue logic:
           * - false → message discarded
           * - true  → retry
           */
          this.channel.nack(msg, false, true);
        }
      },
      { noAck: false }
    );
  }

  //  Graceful Shutdown
  async close(): Promise<void> {
    try {
      await this.channel?.close();
      await this.connection?.close();
      logger.info("RabbitMQ connection closed");
    } catch (err) {
      logger.error("RabbitMQ close error:", err);
    }
  }
}

const rabbitMQ = new _rabbitMQ(ENV.RABBITMQ_URL, "jobs.exchange");
export default rabbitMQ;
