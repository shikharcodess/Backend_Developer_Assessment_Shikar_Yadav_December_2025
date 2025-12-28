"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const amqplib_1 = __importDefault(require("amqplib"));
const env_1 = require("../../config/env/env");
const logger_1 = require("../../common/logger");
const db_1 = require("../../config/db/db");
const redis_1 = __importDefault(require("../../common/redis"));
class _rabbitMQ {
    constructor(url, exchange, exchangeType) {
        this.isConnecting = false;
        this.retryDelay = 5000;
        this.maxRetries = 10;
        this.url = url;
        ((this.exchange = exchange), (this.exchangeType = exchangeType || "topic"));
    }
    async connect(retry = 0) {
        if (this.connection || this.isConnecting)
            return;
        this.isConnecting = true;
        try {
            this.connection = await amqplib_1.default.connect(this.url);
            this.channel = await this.connection.createChannel();
            await this.channel.assertExchange(this.exchange, this.exchangeType, {
                durable: true,
            });
            this.connection.on("close", () => {
                logger_1.logger.info("RabbitMQ connection closed. Reconnecting...");
                this.reset();
                this.connect();
            });
            this.connection.on("error", (err) => {
                logger_1.logger.error("RabbitMQ connection error:", err);
            });
            logger_1.logger.info("RabbitMQ connected");
        }
        catch (err) {
            logger_1.logger.error("RabbitMQ connection failed:", err);
            if (retry < this.maxRetries) {
                await this.delay(this.retryDelay);
                return this.connect(retry + 1);
            }
            throw err;
        }
        finally {
            this.isConnecting = false;
        }
    }
    reset() {
        this.connection = undefined;
        this.channel = undefined;
    }
    delay(ms) {
        return new Promise((res) => setTimeout(res, ms));
    }
    async publish(routingKey, payload, options = {}) {
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
    async consume(queue, routingKey, handler) {
        await this.connect();
        await this.channel.assertQueue(queue, {
            durable: true,
        });
        await this.channel.bindQueue(queue, this.exchange, routingKey);
        await this.channel.prefetch(1);
        await this.channel.consume(queue, async (msg) => {
            if (!msg)
                return;
            try {
                const content = JSON.parse(msg.content.toString());
                const jobData = await db_1.prisma.job.findUnique({
                    where: { id: content.jobId },
                });
                if (!jobData) {
                    this.channel.nack(msg, false, false);
                    return;
                }
                if (jobData.attempts >= jobData.maxAttempts) {
                    await db_1.prisma.job.update({
                        where: { id: jobData.id },
                        data: { status: "FAILED" },
                    });
                    this.channel.nack(msg, false, false);
                    return;
                }
                if (!jobData.idempotencyKey) {
                    this.channel.nack(msg, false, false);
                    return;
                }
                const exists = await redis_1.default.redisClient.get(jobData.idempotencyKey);
                if (exists) {
                    this.channel.ack(msg);
                    return;
                }
                await redis_1.default.redisClient.set(jobData.idempotencyKey, "1", "EX", 86400);
                await handler({ payload: jobData.payload }, msg);
                await db_1.prisma.job.update({
                    where: { id: jobData.id },
                    data: {
                        status: "COMPLETED",
                        attempts: jobData.attempts + 1,
                    },
                });
                this.channel.ack(msg);
            }
            catch (err) {
                logger_1.logger.error("Job processing failed", err);
                this.channel.nack(msg, false, true); // retry
            }
        }, { noAck: false });
    }
    //  Graceful Shutdown
    async close() {
        try {
            await this.channel?.close();
            await this.connection?.close();
            logger_1.logger.info("RabbitMQ connection closed");
        }
        catch (err) {
            logger_1.logger.error("RabbitMQ close error:", err);
        }
    }
}
const rabbitMQ = new _rabbitMQ(env_1.ENV.RABBITMQ_URL, "jobs.exchange");
exports.default = rabbitMQ;
//# sourceMappingURL=rabbitmq.js.map