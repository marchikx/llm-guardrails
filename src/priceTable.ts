export type CostTier = "TIER_0" | "TIER_1" | "TIER_2" | "TIER_3" | "TIER_4";

export interface ModelPrice {
  inputPer1k: number;
  outputPer1k: number;
  tier: CostTier;
  canonical: string;
}

export const MODEL_PRICES: Record<string, ModelPrice> = {
  "claude-3-haiku": {
    inputPer1k: 0.00025,
    outputPer1k: 0.00125,
    tier: "TIER_2",
    canonical: "claude-3-haiku",
  },
  "gpt-4o-mini": {
    inputPer1k: 0.00015,
    outputPer1k: 0.0006,
    tier: "TIER_2",
    canonical: "gpt-4o-mini",
  },
  "claude-3-5-sonnet": {
    inputPer1k: 0.003,
    outputPer1k: 0.015,
    tier: "TIER_3",
    canonical: "claude-3-5-sonnet",
  },
  "gpt-4o": {
    inputPer1k: 0.0025,
    outputPer1k: 0.01,
    tier: "TIER_3",
    canonical: "gpt-4o",
  },
  "claude-opus-4-7": {
    inputPer1k: 0.015,
    outputPer1k: 0.075,
    tier: "TIER_4",
    canonical: "claude-opus-4-7",
  },
  "claude-opus": {
    inputPer1k: 0.015,
    outputPer1k: 0.075,
    tier: "TIER_4",
    canonical: "claude-opus-4-7",
  },
  "openrouter/free": {
    inputPer1k: 0,
    outputPer1k: 0,
    tier: "TIER_0",
    canonical: "openrouter-free",
  },
};

export const MIN_ROI_RATIO_BY_TIER: Record<CostTier, number> = {
  TIER_0: 0,
  TIER_1: 1,
  TIER_2: 3,
  TIER_3: 5,
  TIER_4: 10,
};

export const DAILY_HARD_CAP_USD = 50;

export function priceLlmCall(
  model: string,
  promptTokens: number,
  completionTokens: number,
): { costUsd: number; tier: CostTier; canonical: string } {
  const price = MODEL_PRICES[model];
  if (!price) {
    return { costUsd: 0.1, tier: "TIER_3", canonical: model || "unknown-llm" };
  }
  const costUsd =
    (promptTokens / 1000) * price.inputPer1k +
    (completionTokens / 1000) * price.outputPer1k;
  return { costUsd, tier: price.tier, canonical: price.canonical };
}
