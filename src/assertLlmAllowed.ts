import { gateCall, type CostGateInput, type GateCallOptions } from "./costGate.js";
import { defaultCostStore, makeCorrelationId, type InMemoryCostStore } from "./costMeter.js";
import { priceLlmCall } from "./priceTable.js";

export type LlmGateContext = {
  organizationId?: string;
  action: string;
  expectedRevenueUpliftUsd?: number;
  bypass?: boolean;
};

export type AssertLlmOptions = GateCallOptions & {
  store?: InMemoryCostStore;
};

function resolveOrgId(ctx?: LlmGateContext): string {
  return ctx?.organizationId?.trim() || "default-org";
}

export class LlmNotAllowedError extends Error {
  readonly reason: string;

  constructor(reason: string) {
    super(`LLM call blocked: ${reason}`);
    this.name = "LlmNotAllowedError";
    this.reason = reason;
  }
}

export function assertLlmAllowed(
  model: string,
  promptTokens: number,
  completionTokens: number,
  ctx: LlmGateContext,
  options: AssertLlmOptions = {},
): { correlationId: string } {
  const organizationId = resolveOrgId(ctx);
  const input: CostGateInput = {
    organizationId,
    action: ctx.action,
    model,
    promptTokens,
    completionTokens,
    expectedRevenueUpliftUsd: ctx.expectedRevenueUpliftUsd ?? 0,
    bypass: ctx.bypass,
  };
  const gate = gateCall(input, options);
  if (!gate.ok) {
    throw new LlmNotAllowedError(gate.reason ?? "unknown");
  }
  return { correlationId: makeCorrelationId(ctx.action) };
}

export function recordLlmSpend(
  _correlationId: string,
  ctx: LlmGateContext,
  model: string,
  promptTokens: number,
  completionTokens: number,
  options: AssertLlmOptions = {},
): void {
  const store = options.store ?? defaultCostStore;
  const priced = priceLlmCall(model, promptTokens, completionTokens);
  store.recordSpend(resolveOrgId(ctx), priced.costUsd);
}
