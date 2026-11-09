import {
  DAILY_HARD_CAP_USD,
  MIN_ROI_RATIO_BY_TIER,
  priceLlmCall,
  type CostTier,
} from "./priceTable.js";
import { defaultCostStore, type InMemoryCostStore } from "./costMeter.js";

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

export function gateCall(
  input: CostGateInput,
  options: GateCallOptions = {},
): CostGateResult {
  const store = options.store ?? defaultCostStore;
  const dailyBudgetUsd = options.dailyHardCapUsd ?? DAILY_HARD_CAP_USD;
  const hardCapUsd = dailyBudgetUsd;
  const budgetUsedUsd = store.getDailySpendUsd(input.organizationId);

  let priced: ReturnType<typeof priceLlmCall>;
  try {
    priced = priceLlmCall(
      input.model,
      input.promptTokens,
      input.completionTokens,
    );
  } catch {
    return {
      ok: false,
      tier: "TIER_3",
      predictedCostUsd: 0,
      reason: "UNKNOWN_MODEL",
      budgetUsedUsd,
      dailyBudgetUsd,
    };
  }

  const base: CostGateResult = {
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
  const ratio =
    priced.costUsd > 0
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
