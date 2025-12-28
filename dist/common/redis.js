"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("../config/env/env");
class _RedisService {
    constructor(options) {
        this._options = options;
        this.redisClient = new ioredis_1.default({
            host: this._options.redisHost,
            port: this._options.redisPort,
            username: this._options.redisUser,
            password: this._options.redisPassword,
            maxRetriesPerRequest: null,
        });
    }
}
const redisService = new _RedisService({
    redisHost: env_1.ENV.REDIS_HOST,
    redisPort: env_1.ENV.REDIS_PORT,
    redisUser: env_1.ENV.REDIS_USER,
    redisPassword: env_1.ENV.REDIS_PASSWORD,
});
exports.default = redisService;
//# sourceMappingURL=redis.js.map