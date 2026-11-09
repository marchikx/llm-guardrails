import { type GateCallOptions } from "./costGate.js";
import { type InMemoryCostStore } from "./costMeter.js";
export type LlmGateContext = {
    organizationId?: string;
    action: string;
    expectedRevenueUpliftUsd?: number;
    skipRoiCheck?: boolean;
};
export type AssertLlmOptions = GateCallOptions & {
    store?: InMemoryCostStore;
};
export declare class LlmNotAllowedError extends Error {
    readonly reason: string;
    constructor(reason: string);
}
export declare function assertLlmAllowed(model: string, promptTokens: number, completionTokens: number, ctx: LlmGateContext, options?: AssertLlmOptions): {
    correlationId: string;
};
export declare function recordLlmSpend(_correlationId: string, ctx: LlmGateContext, model: string, promptTokens: number, completionTokens: number, options?: AssertLlmOptions): void;
