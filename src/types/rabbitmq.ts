import { ConsumeMessage, Options } from "amqplib";

export type PublishOptions = Options.Publish;
export type ConsumeHandler<T = any> = (
  data: T,
  raw: ConsumeMessage
) => Promise<void>;
