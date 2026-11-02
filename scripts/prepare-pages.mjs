import { readFileSync, writeFileSync } from 'node:fs';
const base = process.env.PAGES_BASE_PATH || '/';
if (!/^\/(?:[A-Za-z0-9_.-]+\/)*$/.test(base))
  throw new Error('Expected a root-relative base ending with /');
// Keep build and fallback configuration identical; fail rather than publish mismatched paths.
const index = readFileSync('dist/index.html', 'utf8');
if (!index.includes(`var base = '${base}'`) && !index.includes(`var base = "${base}"`))
  throw new Error('Build base does not match Pages fallback base');
writeFileSync(
  'dist/404.html',
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Opening research platform</title></head><body><p>Opening the research platform…</p><script>
const base=${JSON.stringify(base)};
if(location.pathname.startsWith(base)){
 const target=new URL(base,location.origin);
 target.searchParams.set('__snrp_route','/'+location.pathname.slice(base.length)+location.search+location.hash);
 location.replace(target.href);
}
</script></body></html>`,
);
