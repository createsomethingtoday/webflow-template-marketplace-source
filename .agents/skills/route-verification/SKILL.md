---
name: route-verification
description: Prove a change to the marketplace redesign works and record the evidence. Use after any code change, before a PR or push, or when asked whether routes, buyer flows or the preview still work. Covers the check, test, build and live-preview steps, the evidence files and the acceptance rules.
---

# Route verification

## Steps

Run in order from this repo root. Stop at the first failure and report its output.

```sh
npm run check
npm test                       # test/routes.test.mjs
npm run build
node scripts/verify-preview.mjs
```

If catalog pages return 503 and the server log shows `fetch failed … ETIMEDOUT` for the search worker, the worker's TCP connect is slower than Node's 250 ms happy-eyeballs attempt. Start the server with `NODE_OPTIONS=--network-family-autoselection-attempt-timeout=3000`.

`verify-preview.mjs` checks the running preview at `http://localhost:4321`. Set `PREVIEW_URL` to check a separately started build server instead. For each route it checks status, page text, `noindex`, canonical `https://webflow.com<path>`, no leftover `source-island` tags, and one shell `AgentTools` island with the expected `data-agent-surface`. On a detail page it also checks for a real purchase link, a real browser preview, "Similar templates", and unescaped SSR styles.

To prove WebMCP registration, call `verifyAgentTools(page, origin)` from `scripts/browser/agent-tools.mjs` with an ego-browser or Playwright page. A stub `document.modelContext` records the tools each route registers. The check fails on a missing, extra or duplicate tool. It runs no tool.

## Evidence

| File | Holds |
|---|---|
| `evidence/http-verification.json` | Receipts from the running preview |
| `evidence/build-http-verification.json` | Receipts from a build server |
| `evidence/verification.md` | Human summary |

Write new receipts only from a real run. Never edit receipts by hand.

## Acceptance rules

- An iframe that loads is not a working booking or form. The Services Calendly event returns 404 today. Booking stays unaccepted until a current URL exists.
- Dev blocks sends (support, Slack, certification, chat, booking, checkout). A blocked send in dev is correct. Do not send one to "prove" a flow.
- Analytics stay off in dev. On a production Webflow origin they need explicit optional consent.
- Template demo iframes do not load on localhost (CSP `frame-ancestors`). Check playback on an allowed Webflow origin, or through the `marketplace-dev.webflow.com` alias described in `marketplace-redesign`.
