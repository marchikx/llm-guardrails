function utcDayKey(now = new Date()) {
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;
}
export class InMemoryCostStore {
    spendByOrgDay = new Map();
    killSwitchByOrg = new Map();
    globalKillSwitch = false;
    records = [];
    recordSpend(organizationId, costUsd, at = new Date()) {
        if (costUsd < 0) {
            throw new Error("costUsd must be non-negative");
        }
        const dayKey = utcDayKey(at);
        const mapKey = `${organizationId}:${dayKey}`;
        const prev = this.spendByOrgDay.get(mapKey) ?? 0;
        this.spendByOrgDay.set(mapKey, prev + costUsd);
        this.records.push({ organizationId, costUsd, recordedAt: at, dayKey });
    }
    getDailySpendUsd(organizationId, at = new Date()) {
        const dayKey = utcDayKey(at);
        return this.spendByOrgDay.get(`${organizationId}:${dayKey}`) ?? 0;
    }
    setKillSwitch(on, organizationId) {
        if (organizationId) {
            this.killSwitchByOrg.set(organizationId, on);
            return;
        }
        this.globalKillSwitch = on;
    }
    getKillSwitch(organizationId) {
        if (organizationId && this.killSwitchByOrg.get(organizationId)) {
            return true;
        }
        return this.globalKillSwitch;
    }
    getRecords() {
        return this.records;
    }
    clear() {
        this.spendByOrgDay.clear();
        this.killSwitchByOrg.clear();
        this.globalKillSwitch = false;
        this.records.length = 0;
    }
}
/** Shared default store for single-process gateways. */
export const defaultCostStore = new InMemoryCostStore();
export function makeCorrelationId(action) {
    const slug = action.replace(/[^a-z0-9]+/gi, "-").slice(0, 32);
    const rand = Math.random().toString(36).slice(2, 10);
    return `corr_${slug}_${rand}`;
}
