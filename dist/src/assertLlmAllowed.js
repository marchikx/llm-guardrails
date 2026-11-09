import { gateCall } from "./costGate.js";
import { defaultCostStore, makeCorrelationId } from "./costMeter.js";
import { priceLlmCall } from "./priceTable.js";
function resolveOrgId(ctx) {
    return ctx?.organizationId?.trim() || "default-org";
}
export class LlmNotAllowedError extends Error {
    reason;
    constructor(reason) {
        super(`LLM call blocked: ${reason}`);
        this.name = "LlmNotAllowedError";
        this.reason = reason;
    }
}
export function assertLlmAllowed(model, promptTokens, completionTokens, ctx, options = {}) {
    const organizationId = resolveOrgId(ctx);
    const input = {
        organizationId,
        action: ctx.action,
        model,
        promptTokens,
        completionTokens,
        expectedRevenueUpliftUsd: ctx.expectedRevenueUpliftUsd ?? 0,
        skipRoiCheck: ctx.skipRoiCheck,
    };
    const gate = gateCall(input, options);
    if (!gate.ok) {
        throw new LlmNotAllowedError(gate.reason ?? "unknown");
    }
    return { correlationId: makeCorrelationId(ctx.action) };
}
export function recordLlmSpend(_correlationId, ctx, model, promptTokens, completionTokens, options = {}) {
    const store = options.store ?? defaultCostStore;
    const priced = priceLlmCall(model, promptTokens, completionTokens);
    store.recordSpend(resolveOrgId(ctx), priced.costUsd);
}
