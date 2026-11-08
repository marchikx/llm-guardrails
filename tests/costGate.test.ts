import { describe, expect, it, beforeEach } from "vitest";
import { gateCall } from "../src/costGate.js";
import { InMemoryCostStore } from "../src/costMeter.js";

const org = "org_test";

function baseInput(overrides: Partial<Parameters<typeof gateCall>[0]> = {}) {
  return {
    organizationId: org,
    action: "score.lead",
    model: "gpt-4o-mini",
    promptTokens: 100,
    completionTokens: 50,
    expectedRevenueUpliftUsd: 10,
    ...overrides,
  };
}

describe("gateCall", () => {
  let store: InMemoryCostStore;

  beforeEach(() => {
    store = new InMemoryCostStore();
    store.clear();
  });

  it("blocks when kill switch is active", () => {
    store.setKillSwitch(true, org);
    const result = gateCall(baseInput(), { store });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("COST_KILL_SWITCH_ACTIVE");
  });

  it("blocks when daily hard cap would be exceeded", () => {
    store.recordSpend(org, 50);
    const result = gateCall(baseInput(), { store });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("BUDGET_HARD_CAP_EXCEEDED");
  });

  it("blocks TIER_4 models", () => {
    const result = gateCall(
      baseInput({
        model: "claude-opus",
        promptTokens: 500,
        completionTokens: 200,
        expectedRevenueUpliftUsd: 1_000,
      }),
      { store },
    );
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("TIER_4_FORBIDDEN");
  });

  it("allows a cheap call with sufficient ROI", () => {
    const result = gateCall(
      baseInput({
        model: "openrouter/free",
        promptTokens: 200,
        completionTokens: 100,
        expectedRevenueUpliftUsd: 0,
      }),
      { store },
    );
    expect(result.ok).toBe(true);
    expect(result.tier).toBe("TIER_0");
  });

  describe("skipRoiCheck", () => {
    it("skips only the ROI ratio", () => {
      const noUplift = baseInput({ expectedRevenueUpliftUsd: 0 });
      expect(gateCall(noUplift, { store }).reason).toBe("ROI_RATIO_BELOW_MIN");
      expect(gateCall({ ...noUplift, skipRoiCheck: true }, { store }).ok).toBe(true);
    });

    it("can never override the kill switch", () => {
      store.setKillSwitch(true, org);
      const result = gateCall(baseInput({ skipRoiCheck: true }), { store });
      expect(result).toMatchObject({ ok: false, reason: "COST_KILL_SWITCH_ACTIVE" });
    });

    it("can never override the daily hard cap", () => {
      store.recordSpend(org, 50);
      const result = gateCall(baseInput({ skipRoiCheck: true }), { store });
      expect(result).toMatchObject({ ok: false, reason: "BUDGET_HARD_CAP_EXCEEDED" });
    });

    it("can never unlock TIER_4 models", () => {
      const result = gateCall(baseInput({ model: "claude-opus", skipRoiCheck: true }), { store });
      expect(result).toMatchObject({ ok: false, reason: "TIER_4_FORBIDDEN" });
    });
  });
});
