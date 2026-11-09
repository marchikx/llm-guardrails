const PATTERNS = {
    email: /[\w.+-]+@[\w-]+\.[\w.-]+/g,
    phone: /\+?\d{1,3}[\s-]?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,9}/g,
    ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
    creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    stripeKey: /\b(sk|rk|pk|whsec)_(test|live)?_?[A-Za-z0-9]{16,}\b/g,
    bearerToken: /\bBearer\s+[A-Za-z0-9\-._~+/]+=*\b/g,
    jwt: /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g,
    openaiKey: /\bsk-[A-Za-z0-9]{20,}\b/g,
};
export function redactPII(text) {
    let redacted = text;
    const stripped = {};
    for (const [name, pattern] of Object.entries(PATTERNS)) {
        const flags = pattern.flags;
        const re = new RegExp(pattern.source, flags);
        const matches = [...text.matchAll(re)].map((m) => m[0]);
        if (matches.length > 0) {
            stripped[name] = matches;
            redacted = redacted.replace(re, `[REDACTED_${name.toUpperCase()}]`);
        }
    }
    return { redacted, stripped };
}
export function redactPIIInValue(value) {
    if (typeof value === "string")
        return redactPII(value).redacted;
    if (Array.isArray(value))
        return value.map(redactPIIInValue);
    if (value && typeof value === "object") {
        const out = {};
        for (const [k, v] of Object.entries(value)) {
            out[k] = redactPIIInValue(v);
        }
        return out;
    }
    return value;
}
