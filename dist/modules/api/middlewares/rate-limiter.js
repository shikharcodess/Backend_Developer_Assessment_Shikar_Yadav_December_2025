"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ratelimiter = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const redis = new ioredis_1.default();
const ratelimiter = async (req, res, next) => {
    const key = `rate:${req.ip}`;
    const limit = process.env.RATE_LIMITER_ALLOWED_REQUESTS
        ? Number(process.env.RATE_LIMITER_ALLOWED_REQUESTS)
        : 5; // requesr per second
    const window = process.env.RATE_LIMITER_DURARION
        ? Number(process.env.RATE_LIMITER_DURARION)
        : 60; // seconds
    const current = await redis.incr(key);
    if (current === 1) {
        await redis.expire(key, window);
    }
    if (current > limit) {
        return res.status(429).json({ error: "Too many requests" });
    }
    next();
};
exports.ratelimiter = ratelimiter;
//# sourceMappingURL=rate-limiter.js.map