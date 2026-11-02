import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, extname } from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
const base = process.env.PAGES_BASE_PATH || '/MinistryProjects/';
const directory = resolve('dist');
const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};
const server = createServer((req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  const file = resolve(directory, decodeURIComponent(path.slice(base.length)) || 'index.html');
  if (
    path.startsWith(base) &&
    file.startsWith(directory + '/') &&
    existsSync(file) &&
    statSync(file).isFile()
  ) {
    res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' });
    res.end(readFileSync(file));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(readFileSync('dist/404.html'));
  }
});
await new Promise((r) => server.listen(4180, '127.0.0.1', r));
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  args: ['--no-sandbox'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
const brokenAssets = [];
const checks = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('response', (r) => {
  if (r.status() >= 400 && /\.(?:js|css|woff2?|svg)(?:\?|$)/.test(r.url()))
    brokenAssets.push(r.url());
});
mkdirSync('docs/evidence/deployment', { recursive: true });
try {
  const prefix = 'http://127.0.0.1:4180' + base;
  await page.goto(prefix + 'explorer?gov=DAM&yr=2023');
  await page.locator('.map-node').first().waitFor();
  assert.equal(new URL(page.url()).searchParams.has('__snrp_route'), false);
  assert.equal(new URL(page.url()).pathname, base + 'explorer');
  checks.push('Real static 404 redirects to index and restores clean nested route/query');
  await page.reload();
  await page.locator('.map-node').first().waitFor();
  assert.equal(new URL(page.url()).searchParams.get('gov'), 'DAM');
  checks.push('Direct explorer refresh preserves filters');
  await page.getByRole('button', { name: 'Switch to English', exact: true }).click();
  assert.equal(await page.locator('html').getAttribute('dir'), 'ltr');
  await page.getByRole('button', { name: 'Appearance', exact: true }).click();
  await page.getByRole('button', { name: 'Dark', exact: true }).click();
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
  checks.push('English LTR and dark mode operate under repository base');
  await page
    .getByRole('navigation', { name: 'Primary navigation', exact: true })
    .getByRole('link', { name: 'Research Operations', exact: true })
    .click();
  assert.equal(new URL(page.url()).pathname, base + 'research');
  await page.reload();
  await page.getByRole('heading', { name: 'Research Operations', exact: true }).waitFor();
  checks.push('Other workspace navigation and refresh retain repository prefix');
  await page.goto(prefix);
  await page.locator('.map-node').first().waitFor();
  assert.equal(new URL(page.url()).pathname, base + 'explorer');
  checks.push('Repository landing redirects to Explorer');
  await page.setViewportSize({ width: 390, height: 950 });
  await page.getByRole('button', { name: 'Switch to Arabic', exact: true }).click();
  assert.equal(await page.locator('html').getAttribute('dir'), 'rtl');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  checks.push('Arabic RTL responsive mobile remains within viewport');
  await page.screenshot({
    path: 'docs/evidence/deployment/pages-mobile-dark.png',
    fullPage: true,
    animations: 'disabled',
  });
  await page.getByRole('button', { name: 'المظهر', exact: true }).click();
  await page.getByRole('button', { name: 'فاتح', exact: true }).click();
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
  checks.push('Light mode works after Arabic switching');
  assert.deepEqual(brokenAssets, []);
  assert.deepEqual(errors, []);
  checks.push('No broken JS/CSS/fonts/favicon or runtime errors');
  writeFileSync(
    'docs/evidence/deployment/static-pages-results.json',
    JSON.stringify(
      {
        passed: true,
        checks,
        errors,
        brokenAssets,
        scope: 'Local GitHub Pages equivalent only; not a live deployment',
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ passed: true, checks: checks.length }));
} finally {
  await browser.close();
  await new Promise((r) => server.close(r));
}
