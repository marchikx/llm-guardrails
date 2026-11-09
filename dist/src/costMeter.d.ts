export type SpendRecord = {
    organizationId: string;
    costUsd: number;
    recordedAt: Date;
    dayKey: string;
};
export declare class InMemoryCostStore {
    private readonly spendByOrgDay;
    private readonly killSwitchByOrg;
    private globalKillSwitch;
    private readonly records;
    recordSpend(organizationId: string, costUsd: number, at?: Date): void;
    getDailySpendUsd(organizationId: string, at?: Date): number;
    setKillSwitch(on: boolean, organizationId?: string): void;
    getKillSwitch(organizationId?: string): boolean;
    getRecords(): readonly SpendRecord[];
    clear(): void;
}
/** Shared default store for single-process gateways. */
export declare const defaultCostStore: InMemoryCostStore;
export declare function makeCorrelationId(action: string): string;
