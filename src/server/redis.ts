import Redis from "ioredis";

declare global {
    // eslint-disable-next-line no-var
    var redis: Redis | null;
}

const REDIS_URL = process.env.REDIS_URL;

/**
 * Creates a Redis client with connection caching for Next.js hot reloads.
 * Supports both Upstash (with TLS) and local Redis instances.
 */
function createRedisClient(): Redis | null {
    if (!REDIS_URL) {
        console.warn(
            "REDIS_URL not defined. Caching and rate limiting will be disabled."
        );
        return null;
    }

    // Check for cached connection in development
    if (process.env.NODE_ENV === "development") {
        if (global.redis) {
            return global.redis;
        }
    }

    const client = new Redis(REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
            const delay = Math.min(times * 50, 2000);
            return delay;
        },
        // Enable TLS for Upstash connections
        tls: REDIS_URL.startsWith("rediss://") ? {} : undefined,
    });

    client.on("error", (err) => {
        console.error("Redis connection error:", err);
    });

    client.on("connect", () => {
        console.log("Redis connected successfully");
    });

    // Cache in development
    if (process.env.NODE_ENV === "development") {
        global.redis = client;
    }

    return client;
}

const redis = createRedisClient();

/**
 * Cache wrapper with automatic JSON serialization
 */
export async function getFromCache<T>(key: string): Promise<T | null> {
    if (!redis) return null;

    try {
        const cached = await redis.get(key);
        if (cached) {
            return JSON.parse(cached) as T;
        }
        return null;
    } catch (error) {
        console.error("Redis get error:", error);
        return null;
    }
}

/**
 * Set cache with expiration (default: 1 hour)
 */
export async function setToCache(
    key: string,
    value: unknown,
    expirationSeconds: number = 3600
): Promise<void> {
    if (!redis) return;

    try {
        await redis.setex(key, expirationSeconds, JSON.stringify(value));
    } catch (error) {
        console.error("Redis set error:", error);
    }
}

/**
 * Rate limiter implementation
 * Returns true if request is allowed, false if rate limited
 */
export async function checkRateLimit(
    identifier: string,
    maxRequests: number = 5,
    windowSeconds: number = 60
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
    if (!redis) {
        // If Redis is not available, allow all requests
        return { allowed: true, remaining: maxRequests, resetIn: 0 };
    }

    const key = `ratelimit:${identifier}`;

    try {
        const multi = redis.multi();
        multi.incr(key);
        multi.ttl(key);

        const results = await multi.exec();
        if (!results) {
            return { allowed: true, remaining: maxRequests, resetIn: 0 };
        }

        const count = results[0][1] as number;
        let ttl = results[1][1] as number;

        // Set expiration on first request
        if (ttl === -1) {
            await redis.expire(key, windowSeconds);
            ttl = windowSeconds;
        }

        const allowed = count <= maxRequests;
        const remaining = Math.max(0, maxRequests - count);

        return { allowed, remaining, resetIn: ttl };
    } catch (error) {
        console.error("Rate limit check error:", error);
        return { allowed: true, remaining: maxRequests, resetIn: 0 };
    }
}

export default redis;
