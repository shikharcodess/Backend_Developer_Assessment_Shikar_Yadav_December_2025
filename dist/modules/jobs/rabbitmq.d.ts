import { ConsumeHandler, PublishOptions } from "../../types/rabbitmq";
declare class _rabbitMQ {
    private connection;
    private channel;
    private readonly url;
    private readonly exchange;
    private readonly exchangeType;
    private isConnecting;
    private retryDelay;
    private maxRetries;
    constructor(url: string, exchange: string, exchangeType?: "direct" | "topic" | "fanout");
    connect(retry?: number): Promise<void>;
    private reset;
    private delay;
    publish<T>(routingKey: string, payload: T, options?: PublishOptions): Promise<void>;
    consume<T>(queue: string, routingKey: string, handler: ConsumeHandler<T>): Promise<void>;
    close(): Promise<void>;
}
declare const rabbitMQ: _rabbitMQ;
export default rabbitMQ;
