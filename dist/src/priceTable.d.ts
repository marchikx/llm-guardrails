export type CostTier = "TIER_0" | "TIER_1" | "TIER_2" | "TIER_3" | "TIER_4";
export interface ModelPrice {
    inputPer1k: number;
    outputPer1k: number;
    tier: CostTier;
    canonical: string;
}
export declare const MODEL_PRICES: Record<string, ModelPrice>;
export declare const MIN_ROI_RATIO_BY_TIER: Record<CostTier, number>;
export declare const DAILY_HARD_CAP_USD = 50;
export declare function priceLlmCall(model: string, promptTokens: number, completionTokens: number): {
    costUsd: number;
    tier: CostTier;
    canonical: string;
};
