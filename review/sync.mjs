// Refresh this review copy from the source package.
// Usage: node review/sync.mjs <path to packages/webflow-marketplace-source> [source commit]
import { cp, readdir, readFile, rm, writeFile, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const [srcArg, sourceCommit = 'unknown'] = process.argv.slice(2);
if (!srcArg) throw new Error('Usage: node review/sync.mjs <source package dir> [source commit]');
const src = resolve(srcArg);
const dest = resolve(new URL('..', import.meta.url).pathname);
if (!(await stat(join(src, 'astro.config.mjs')).catch(() => null))) throw new Error(`Not the source package: ${src}`);

// Files this repo owns. A refresh never removes or replaces them.
const OWNED = new Set(['.git', '.github', '.agents', 'review']);
// Local build output and secrets. Never copied, never removed.
const LOCAL = new Set(['node_modules', 'dist', '.astro', '.webflow']);
const skip = (name) => OWNED.has(name) || LOCAL.has(name) || name === '.env' || (name.startsWith('.env.') && name !== '.env.example');

for (const name of await readdir(dest)) if (!skip(name)) await rm(join(dest, name), { recursive: true });
for (const name of await readdir(src)) if (!skip(name)) await cp(join(src, name), join(dest, name), { recursive: true });

// Fonts: this repo does not redistribute font files. The CSS loads them from Webflow's CDN.
const cdn = JSON.parse(await readFile(join(dest, 'review/font-cdn-map.json'), 'utf8'));
const key = (name) => decodeURIComponent(name).replace(/[\s_-]+/g, '-').toLowerCase();
const cssDir = join(dest, 'public/export/css');
const missing = [];
let rewritten = 0;
for (const file of await readdir(cssDir)) {
  if (!file.endsWith('.css')) continue;
  const path = join(cssDir, file);
  const before = await readFile(path, 'utf8');
  const after = before.replace(/url\((['"]?)\.\.\/fonts\/([^'")]+)\1\)/g, (match, _q, name) => {
    const url = cdn[key(name)];
    if (!url) { missing.push(name); return match; }
    rewritten += 1;
    return `url('${url}')`;
  });
  if (after !== before) await writeFile(path, after);
}
if (missing.length) throw new Error(`No CDN URL in review/font-cdn-map.json for: ${[...new Set(missing)].join(', ')}`);
await rm(join(dest, 'public/export/fonts'), { recursive: true, force: true });

// Docs: remove local paths and deployment ids, then put the reviewer section first.
const scrub = (text) => text
  .replace(/ Worktree disposition for this pass:[^.]*\./g, '')
  .replace(/\/Users\/[^/\s`]+/g, '~')
  .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/g, '<id>')
  .replace(/((?:site|workspace) `)[0-9a-f]{24}(`)/g, '$1<id>$2');
const evidence = join(dest, 'evidence');
for (const file of await readdir(evidence).catch(() => [])) {
  if (!file.endsWith('.md')) continue;
  const path = join(evidence, file);
  await writeFile(path, scrub(await readFile(path, 'utf8')));
}
const head = await readFile(join(dest, 'review/README-head.md'), 'utf8');
const notes = scrub(await readFile(join(dest, 'README.md'), 'utf8'))
  .replace(/^# Template Marketplace for Source Nightly/, '## Project notes')
  .replace('exported Webflow styles, fonts, images,', 'exported Webflow styles, images,');
await writeFile(join(dest, 'README.md'), head + notes);
await writeFile(join(dest, 'review/SOURCE'), `createsomethingtoday/create-something-monorepo packages/webflow-marketplace-source @ ${sourceCommit}\n`);
console.log(JSON.stringify({ sourceCommit, fontUrlsRewritten: rewritten }));
