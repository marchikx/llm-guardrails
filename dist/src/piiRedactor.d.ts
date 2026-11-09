export declare function redactPII(text: string): {
    redacted: string;
    stripped: Record<string, string[]>;
};
export declare function redactPIIInValue(value: unknown): unknown;
