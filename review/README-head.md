# Template Marketplace redesign (review copy)

This public repo holds the Template Marketplace redesign so template reviewers can read and run the code without Webflow GitHub access. It is a copy. The live preview is https://webflow-marketplace-source.webflow.io/ and deploys from a different repo, so a push here deploys nothing.

## Review it in Source

1. Clone this repo: `git clone https://github.com/createsomethingtoday/webflow-template-marketplace-source.git`
2. In Source, choose **Connect a codebase** and select the cloned folder.
3. Choose **Site → Run project → Start preview**. Source runs `npm run dev` and serves http://localhost:4321/templates.
4. Project skills in `.agents/skills` appear in Source. Start with `marketplace-redesign`.

Without Source: `npm ci --workspaces=false`, then `npm run dev`. Node 22.12 or later is required.

This copy refreshes from the source branch each day (`review/sync.mjs`, run by `.github/workflows/sync.yml`). Do not edit copied files here; a refresh overwrites them.

Fonts are not in this repo. The CSS loads them from Webflow's CDN, so the preview needs a network connection. Template demo iframes do not load on localhost; see "Local preview restriction" below.

The sections below are the original project notes. Where they say "this package" or "the monorepo", they refer to the source of this copy.

---

