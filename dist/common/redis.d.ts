import IORedis from "ioredis";
interface _RedisServiceOptions {
    redisHost: string;
    redisPort: number;
    redisUser: string;
    redisPassword: string;
}
declare class _RedisService {
    redisClient: IORedis;
    private _options;
    constructor(options: _RedisServiceOptions);
}
declare const redisService: _RedisService;
export default redisService;
