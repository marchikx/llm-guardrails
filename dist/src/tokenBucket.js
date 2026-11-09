export class TokenBucketThrottler {
    maxTokens;
    refillPerSec;
    tokens;
    lastRefill;
    constructor(maxTokens, refillPerSec) {
        this.maxTokens = maxTokens;
        this.refillPerSec = refillPerSec;
        this.tokens = maxTokens;
        this.lastRefill = Date.now();
    }
    refill(now) {
        const elapsed = (now - this.lastRefill) / 1000;
        if (elapsed <= 0)
            return;
        this.tokens = Math.min(this.maxTokens, this.tokens + elapsed * this.refillPerSec);
        this.lastRefill = now;
    }
    tryConsume(count = 1, now = Date.now()) {
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
    availableTokens(now = Date.now()) {
        this.refill(now);
        return this.tokens;
    }
}
