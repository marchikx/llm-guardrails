import { type CostTier } from "./priceTable.js";
import { type InMemoryCostStore } from "./costMeter.js";
export interface CostGateInput {
    organizationId: string;
    action: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    expectedRevenueUpliftUsd: number;
    /** Skips only the ROI ratio check (e.g. internal evals). Kill switch, hard cap and TIER_4 always apply. */
    skipRoiCheck?: boolean;
}
export interface CostGateResult {
    ok: boolean;
    tier: CostTier;
    predictedCostUsd: number;
    reason?: string;
    budgetUsedUsd: number;
    dailyBudgetUsd: number;
}
export type GateCallOptions = {
    store?: InMemoryCostStore;
    dailyHardCapUsd?: number;
};
export declare function gateCall(input: CostGateInput, options?: GateCallOptions): CostGateResult;
