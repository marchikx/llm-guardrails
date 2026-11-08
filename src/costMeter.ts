function utcDayKey(now = new Date()): string {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;
}

export type SpendRecord = {
  organizationId: string;
  costUsd: number;
  recordedAt: Date;
  dayKey: string;
};

export class InMemoryCostStore {
  private readonly spendByOrgDay = new Map<string, number>();
  private readonly killSwitchByOrg = new Map<string, boolean>();
  private globalKillSwitch = false;
  private readonly records: SpendRecord[] = [];

  recordSpend(organizationId: string, costUsd: number, at = new Date()): void {
    if (costUsd < 0) {
      throw new Error("costUsd must be non-negative");
    }
    const dayKey = utcDayKey(at);
    const mapKey = `${organizationId}:${dayKey}`;
    const prev = this.spendByOrgDay.get(mapKey) ?? 0;
    this.spendByOrgDay.set(mapKey, prev + costUsd);
    this.records.push({ organizationId, costUsd, recordedAt: at, dayKey });
  }

  getDailySpendUsd(organizationId: string, at = new Date()): number {
    const dayKey = utcDayKey(at);
    return this.spendByOrgDay.get(`${organizationId}:${dayKey}`) ?? 0;
  }

  setKillSwitch(on: boolean, organizationId?: string): void {
    if (organizationId) {
      this.killSwitchByOrg.set(organizationId, on);
      return;
    }
    this.globalKillSwitch = on;
  }

  getKillSwitch(organizationId?: string): boolean {
    if (organizationId && this.killSwitchByOrg.get(organizationId)) {
      return true;
    }
    return this.globalKillSwitch;
  }

  getRecords(): readonly SpendRecord[] {
    return this.records;
  }

  clear(): void {
    this.spendByOrgDay.clear();
    this.killSwitchByOrg.clear();
    this.globalKillSwitch = false;
    this.records.length = 0;
  }
}

/** Shared default store for single-process gateways. */
export const defaultCostStore = new InMemoryCostStore();

export function makeCorrelationId(action: string): string {
  const slug = action.replace(/[^a-z0-9]+/gi, "-").slice(0, 32);
  const rand = Math.random().toString(36).slice(2, 10);
  return `corr_${slug}_${rand}`;
}
