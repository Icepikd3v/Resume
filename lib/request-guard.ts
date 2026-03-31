import { Redis } from "@upstash/redis";

type RateEntry = {
  count: number;
  resetAt: number;
};

const STORE = new Map<string, RateEntry>();
const USE_UPSTASH = process.env.RATE_LIMIT_STORE === "upstash";
const redis =
  USE_UPSTASH && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? Redis.fromEnv()
    : null;

function cleanupExpired(now: number) {
  for (const [key, value] of STORE.entries()) {
    if (value.resetAt <= now) {
      STORE.delete(key);
    }
  }
}

export function getClientIp(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  return "unknown";
}

function checkRateLimitMemory(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  cleanupExpired(now);

  const existing = STORE.get(key);
  if (!existing || existing.resetAt <= now) {
    STORE.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: Math.max(limit - 1, 0), retryAfterMs: 0 };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(existing.resetAt - now, 0)
    };
  }

  existing.count += 1;
  STORE.set(key, existing);
  return {
    allowed: true,
    remaining: Math.max(limit - existing.count, 0),
    retryAfterMs: 0
  };
}

export async function checkRateLimit(key: string, limit: number, windowMs: number) {
  if (!redis) {
    return checkRateLimitMemory(key, limit, windowMs);
  }

  try {
    const count = await redis.incr(key);
    const windowSeconds = Math.max(Math.ceil(windowMs / 1000), 1);

    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }

    if (count > limit) {
      const ttl = await redis.ttl(key);
      const retryAfterMs = ttl > 0 ? ttl * 1000 : windowMs;
      return {
        allowed: false,
        remaining: 0,
        retryAfterMs
      };
    }

    return {
      allowed: true,
      remaining: Math.max(limit - count, 0),
      retryAfterMs: 0
    };
  } catch {
    return checkRateLimitMemory(key, limit, windowMs);
  }
}
