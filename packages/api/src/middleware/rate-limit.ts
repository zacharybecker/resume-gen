import type { Request, Response, NextFunction } from "express";
import { getUid } from "./auth.js";

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up stale entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < 60_000);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}, 10 * 60_000).unref();

interface RateLimitOptions {
  /** Max requests allowed within the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
}

/**
 * Per-user rate limiter using the authenticated UID.
 * Must be applied AFTER authMiddleware.
 */
export function rateLimitByUser(options: RateLimitOptions) {
  const { maxRequests, windowMs } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const uid = getUid(req);
    const now = Date.now();
    const key = `${uid}:${req.baseUrl}${req.route?.path ?? req.path}`;

    let entry = store.get(key);
    if (!entry) {
      entry = { timestamps: [] };
      store.set(key, entry);
    }

    // Remove timestamps outside the window
    entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

    if (entry.timestamps.length >= maxRequests) {
      const oldestInWindow = entry.timestamps[0];
      const retryAfterMs = windowMs - (now - oldestInWindow);
      const retryAfterSec = Math.ceil(retryAfterMs / 1000);

      res.set("Retry-After", String(retryAfterSec));
      res.status(429).json({
        message: `Too many requests. Please wait ${retryAfterSec} seconds before trying again.`,
      });
      return;
    }

    entry.timestamps.push(now);
    next();
  };
}
