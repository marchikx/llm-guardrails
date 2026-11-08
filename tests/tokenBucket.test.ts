import { describe, expect, it } from "vitest";
import { TokenBucketThrottler } from "../src/tokenBucket.js";

describe("TokenBucketThrottler", () => {
  it("rejects when the bucket is empty", () => {
    const bucket = new TokenBucketThrottler(1, 0);
    const first = bucket.tryConsume(1, 1_000);
    expect(first.ok).toBe(true);
    const second = bucket.tryConsume(1, 1_000);
    expect(second.ok).toBe(false);
    if (!second.ok) {
      expect(second.retryAfterMs).toBeGreaterThan(0);
    }
  });
});
