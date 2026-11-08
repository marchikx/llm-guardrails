export type ThrottleResult = { ok: true } | { ok: false; retryAfterMs: number };

export class TokenBucketThrottler {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private readonly maxTokens: number,
    private readonly refillPerSec: number,
  ) {
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
  }

  private refill(now: number): void {
    const elapsed = (now - this.lastRefill) / 1000;
    if (elapsed <= 0) return;
    this.tokens = Math.min(
      this.maxTokens,
      this.tokens + elapsed * this.refillPerSec,
    );
    this.lastRefill = now;
  }

  tryConsume(count = 1, now = Date.now()): ThrottleResult {
    this.refill(now);
    if (this.tokens >= count) {
      this.tokens -= count;
      return { ok: true };
    }
    const deficit = count - this.tokens;
    const retryAfterMs = Math.ceil((deficit / this.refillPerSec) * 1000);
    return { ok: false, retryAfterMs };
  }

  /** Visible token balance after refill (for tests). */
  availableTokens(now = Date.now()): number {
    this.refill(now);
    return this.tokens;
  }
}
