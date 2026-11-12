---
name: catalog-data
description: Read Template Marketplace catalog data correctly — search API, facets, category pills, creators, detail pages and the CMS bridge. Use when adding or changing anything that shows template, category, creator or count data. Lists the API traps that return wrong numbers.
---

# Catalog data

## Sources

| Data | Source | Code |
|---|---|---|
| Search, facets, category pills | `https://webflow-template-search.webflow-inc.workers.dev` (fixed origin, read only) | `src/lib/api.ts` (`SEARCH_ORIGIN`) |
| Rich detail, directories, legacy collections, creator content | `https://templates.webflow.com` (published CMS) | `src/lib/cms.ts` |

Both are cached in memory for one minute. A cold home render makes 11 catalog calls.

The CMS bridge does not use `webflow.com/templates`. This prevents a fetch loop after a future routing change. Keep it that way.

## API traps

- Scopes: `all`, `featured` (about 652), `free` (about 167).
- `include=facets,pills` together returns `total_items: 0`. Take totals from a plain search.
- Price sorts are ignored. The API falls back to popular.
- `creator_slug` filters by creator.
- `cumulative_purchases` is bucketed, not exact.
- Detail slugs end in `-website-template`, for example `nexgo-website-template`.

## CMS bridge rules

- The bridge removes scripts, executable attributes and embedded frames. Known component data renders through local React components.
- The CMS markup and code-island data are contracts. If a contract changes, return HTTP 503. Never make up content.
- A missing CMS or detail route returns HTTP 404.
- Search is strict. An unmatched term shows an empty state and labeled recommendations.
