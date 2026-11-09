import { DAILY_HARD_CAP_USD, MIN_ROI_RATIO_BY_TIER, priceLlmCall, } from "./priceTable.js";
import { defaultCostStore } from "./costMeter.js";
export function gateCall(input, options = {}) {
    const store = options.store ?? defaultCostStore;
    const dailyBudgetUsd = options.dailyHardCapUsd ?? DAILY_HARD_CAP_USD;
    const hardCapUsd = dailyBudgetUsd;
    const budgetUsedUsd = store.getDailySpendUsd(input.organizationId);
    let priced;
    try {
        priced = priceLlmCall(input.model, input.promptTokens, input.completionTokens);
    }
    catch {
        return {
            ok: false,
            tier: "TIER_3",
            predictedCostUsd: 0,
            reason: "UNKNOWN_MODEL",
            budgetUsedUsd,
            dailyBudgetUsd,
        };
    }
    const base = {
        ok: true,
        tier: priced.tier,
        predictedCostUsd: priced.costUsd,
        budgetUsedUsd,
        dailyBudgetUsd,
    };
    if (store.getKillSwitch(input.organizationId)) {
        return {
            ...base,
            ok: false,
            reason: "COST_KILL_SWITCH_ACTIVE",
        };
    }
    if (budgetUsedUsd + priced.costUsd > hardCapUsd) {
        return {
            ...base,
            ok: false,
            reason: "BUDGET_HARD_CAP_EXCEEDED",
        };
    }
    if (priced.tier === "TIER_4") {
        return {
            ...base,
            ok: false,
            reason: "TIER_4_FORBIDDEN",
        };
    }
    if (input.skipRoiCheck) {
        return base;
    }
    const minRatio = MIN_ROI_RATIO_BY_TIER[priced.tier];
    const ratio = priced.costUsd > 0
        ? input.expectedRevenueUpliftUsd / priced.costUsd
        : Number.POSITIVE_INFINITY;
    if (priced.costUsd > 0 && ratio < minRatio) {
        return {
            ...base,
            ok: false,
            reason: "ROI_RATIO_BELOW_MIN",
        };
    }
    return base;
}
