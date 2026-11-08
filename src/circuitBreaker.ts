export type CircuitState = "closed" | "open" | "half-open";

export type CircuitBreakerOptions = {
  failureThreshold?: number;
  resetTimeoutMs?: number;
  successThresholdInHalfOpen?: number;
};

export class CircuitBreaker {
  private state: CircuitState = "closed";
  private failures = 0;
  private successesInHalfOpen = 0;
  private openedAt: number | null = null;

  private readonly failureThreshold: number;
  private readonly resetTimeoutMs: number;
  private readonly successThresholdInHalfOpen: number;

  constructor(options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold ?? 3;
    this.resetTimeoutMs = options.resetTimeoutMs ?? 5_000;
    this.successThresholdInHalfOpen = options.successThresholdInHalfOpen ?? 1;
  }

  getState(now = Date.now()): CircuitState {
    if (this.state === "open" && this.openedAt !== null) {
      if (now - this.openedAt >= this.resetTimeoutMs) {
        this.state = "half-open";
        this.successesInHalfOpen = 0;
      }
    }
    return this.state;
  }

  canExecute(now = Date.now()): boolean {
    const state = this.getState(now);
    return state === "closed" || state === "half-open";
  }

  recordSuccess(now = Date.now()): void {
    const state = this.getState(now);
    if (state === "half-open") {
      this.successesInHalfOpen += 1;
      if (this.successesInHalfOpen >= this.successThresholdInHalfOpen) {
        this.state = "closed";
        this.failures = 0;
        this.openedAt = null;
        this.successesInHalfOpen = 0;
      }
      return;
    }
    this.failures = 0;
    this.state = "closed";
  }

  recordFailure(now = Date.now()): void {
    const state = this.getState(now);
    if (state === "half-open") {
      this.tripOpen(now);
      return;
    }
    this.failures += 1;
    if (this.failures >= this.failureThreshold) {
      this.tripOpen(now);
    }
  }

  private tripOpen(now: number): void {
    this.state = "open";
    this.openedAt = now;
    this.failures = 0;
    this.successesInHalfOpen = 0;
  }
}
