---
name: component-snapshot
description: Change or refresh the snapshotted marketplace and library components in src/vendor. Use before touching any file under src/vendor, TemplateCard, Catalog, Detail or the library intake preview, or when component-snapshot.json or library-snapshot.json is out of date.
---

# Component snapshot

`src/vendor/` holds copies. Do not hand-edit them.

| Folder | Owner | Refresh | Provenance |
|---|---|---|---|
| `src/vendor/marketplace/` (27 components) | `packages/webflow-components` in the create-something monorepo | `npm run sync:components` | `component-snapshot.json` (SHA-256 per file) |
| `src/vendor/library/` | sibling repo `webflow-library-submission-form` | `node scripts/sync-library.mjs` | `library-snapshot.json` (original hashes and adapter transforms) |

## Change a marketplace component

1. Change it in the owning package, `packages/webflow-components/src/components`.
2. Run its tests there.
3. Run `npm run sync:components` from a checkout where this package sits next to `packages/webflow-components`. The script reads `../webflow-components/src/components`. From a standalone clone of this repo, that path does not exist and the sync fails.
4. Commit the changed vendor files and `component-snapshot.json` together.
5. Run `route-verification`.

## Change the library preview

1. Change it in `webflow-library-submission-form`.
2. Run `node scripts/sync-library.mjs` from this repo.
3. Commit the vendor files and `library-snapshot.json` together.

In dev, every library backend operation returns a visible "development disabled" response. Keep that.
