export type ThrottleResult = {
    ok: true;
} | {
    ok: false;
    retryAfterMs: number;
};
export declare class TokenBucketThrottler {
    private readonly maxTokens;
    private readonly refillPerSec;
    private tokens;
    private lastRefill;
    constructor(maxTokens: number, refillPerSec: number);
    private refill;
    tryConsume(count?: number, now?: number): ThrottleResult;
    /** Visible token balance after refill (for tests). */
    availableTokens(now?: number): number;
}
