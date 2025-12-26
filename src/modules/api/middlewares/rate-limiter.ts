import Redis from "ioredis";
import { Request, Response, NextFunction } from "express";
const redis = new Redis();

export const ratelimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
