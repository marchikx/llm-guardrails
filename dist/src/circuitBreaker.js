export class CircuitBreaker {
    state = "closed";
    failures = 0;
    successesInHalfOpen = 0;
    openedAt = null;
    failureThreshold;
    resetTimeoutMs;
    successThresholdInHalfOpen;
    constructor(options = {}) {
        this.failureThreshold = options.failureThreshold ?? 3;
        this.resetTimeoutMs = options.resetTimeoutMs ?? 5_000;
        this.successThresholdInHalfOpen = options.successThresholdInHalfOpen ?? 1;
    }
    getState(now = Date.now()) {
        if (this.state === "open" && this.openedAt !== null) {
            if (now - this.openedAt >= this.resetTimeoutMs) {
                this.state = "half-open";
                this.successesInHalfOpen = 0;
            }
        }
        return this.state;
    }
    canExecute(now = Date.now()) {
        const state = this.getState(now);
        return state === "closed" || state === "half-open";
    }
    recordSuccess(now = Date.now()) {
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
    recordFailure(now = Date.now()) {
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
    tripOpen(now) {
        this.state = "open";
        this.openedAt = now;
        this.failures = 0;
        this.successesInHalfOpen = 0;
    }
}
