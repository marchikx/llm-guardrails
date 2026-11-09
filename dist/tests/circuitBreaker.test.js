import { describe, expect, it } from "vitest";
import { CircuitBreaker } from "../src/circuitBreaker.js";
describe("CircuitBreaker", () => {
    it("opens after consecutive failures", () => {
        const breaker = new CircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 60_000 });
        const t0 = 10_000;
        breaker.recordFailure(t0);
        breaker.recordFailure(t0 + 1);
        expect(breaker.getState(t0 + 2)).toBe("closed");
        breaker.recordFailure(t0 + 2);
        expect(breaker.getState(t0 + 3)).toBe("open");
        expect(breaker.canExecute(t0 + 3)).toBe(false);
    });
});
