import IORedis from "ioredis";
import { ENV } from "../config/env/env";

interface _RedisServiceOptions {
  redisHost: string;
  redisPort: number;
  redisUser: string;
  redisPassword: string;
}

class _RedisService {
  redisClient: IORedis;

  private _options: _RedisServiceOptions;

  constructor(options: _RedisServiceOptions) {
    this._options = options;

    this.redisClient = new IORedis({
      host: this._options.redisHost,
      port: this._options.redisPort,
      username: this._options.redisUser,
      password: this._options.redisPassword,
      maxRetriesPerRequest: null,
    });
  }
}

const redisService = new _RedisService({
  redisHost: ENV.REDIS_HOST,
  redisPort: ENV.REDIS_PORT,
  redisUser: ENV.REDIS_USER,
  redisPassword: ENV.REDIS_PASSWORD,
});

export default redisService;
