import { describe, expect, it } from "vitest";
import { redactPII } from "../src/piiRedactor.js";

describe("redactPII", () => {
  it("redacts email addresses", () => {
    const { redacted, stripped } = redactPII("Contact buyer@example.com today.");
    expect(redacted).not.toContain("buyer@example.com");
    expect(redacted).toContain("[REDACTED_EMAIL]");
    expect(stripped.email).toContain("buyer@example.com");
  });

  it("redacts stripe secret keys", () => {
    // Built at runtime so the commit never contains a contiguous secret-shaped literal.
    const key = ["sk", "live", "abcdefghijklmnopqrstuvwxyz123456"].join("_");
    const { redacted, stripped } = redactPII(`Key: ${key}`);
    expect(redacted).not.toContain(key);
    expect(redacted).toContain("[REDACTED_STRIPEKEY]");
    expect(stripped.stripeKey?.[0]).toBe(key);
  });
});
