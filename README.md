# llm-guardrails — stop unbounded LLM bills

[![CI](https://github.com/marchikx/llm-guardrails/actions/workflows/ci.yml/badge.svg)](https://github.com/marchikx/llm-guardrails/actions/workflows/ci.yml)

**Audience:** anyone shipping agent/worker code that calls paid models.  
**Promise:** unknown models deny; daily hard cap fail-closed; kill switch; PII/prompt sanitize helpers.

**Demo:** “Block an LLM call” on https://marchikx.github.io/ops-hq-demo/

```ts
import { assertLlmAllowed, InMemoryCostStore } from "llm-guardrails";

assertLlmAllowed("gpt-4o-mini", 100, 50, {
  action: "draft",
  organizationId: "acme",
  expectedRevenueUpliftUsd: 3,
}, { store: new InMemoryCostStore(), dailyHardCapUsd: 50 });
```

```bash
npm run verify
```

Unknown model names return `UNKNOWN_MODEL` — no silent “assume expensive” pricing.

MIT · Hire: https://github.com/marchikx/marchikx/issues/new?template=hire.md
