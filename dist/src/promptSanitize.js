import { redactPII } from "./piiRedactor.js";
const CONTROL_CHAR = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const INJECTION_PATTERNS = [
    /\bsystem\s*:\s*/gi,
    /ignore\s+(all\s+)?previous\s+instructions/gi,
    /ignore\s+(all\s+)?above/gi,
    /you\s+are\s+now\s+/gi,
    /new\s+instructions?:/gi,
    /\boverride\s+(prior|previous|system)\b/gi,
    /<\|im_start\|>/gi,
    /<\|im_end\|>/gi,
    /\bjailbreak/gi,
];
export function stripControlChars(text) {
    return text.replace(CONTROL_CHAR, "");
}
export function sanitizePromptInjection(text, maxLen = 10_000) {
    if (!text)
        return "";
    const cap = Math.max(0, Math.min(maxLen, 500_000));
    let sanitized = stripControlChars(text.replace(/\0/g, ""));
    for (const pattern of INJECTION_PATTERNS) {
        sanitized = sanitized.replace(pattern, "[FILTERED]");
    }
    return sanitized.slice(0, cap);
}
export function sanitizeForPrompt(text) {
    const base = sanitizePromptInjection(text ?? "", 10_000);
    return redactPII(base).redacted;
}
