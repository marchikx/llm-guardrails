export type CircuitState = "closed" | "open" | "half-open";
export type CircuitBreakerOptions = {
    failureThreshold?: number;
    resetTimeoutMs?: number;
    successThresholdInHalfOpen?: number;
};
export declare class CircuitBreaker {
    private state;
    private failures;
    private successesInHalfOpen;
    private openedAt;
    private readonly failureThreshold;
    private readonly resetTimeoutMs;
    private readonly successThresholdInHalfOpen;
    constructor(options?: CircuitBreakerOptions);
    getState(now?: number): CircuitState;
    canExecute(now?: number): boolean;
    recordSuccess(now?: number): void;
    recordFailure(now?: number): void;
    private tripOpen;
}
