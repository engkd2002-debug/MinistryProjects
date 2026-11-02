import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
const evidence = 'docs/evidence/phase-3';
mkdirSync(evidence, { recursive: true });
const records = JSON.parse(readFileSync('src/data/demo/projects.json', 'utf8'));
const baseURL = process.env.SNRP_PREVIEW_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  args: ['--no-sandbox'],
});
const errors = [];
const checks = [];
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text());
});
async function settle() {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .every((a) => a.playState !== 'running' || a.effect?.getTiming().iterations === Infinity),
  );
  if (await page.locator('.geo-map').count())
    await page.waitForFunction(
      () => document.querySelector('.geo-map')?.getAttribute('data-moving') === 'false',
    );
}
async function screenshot(name) {
  await settle();
  await page.screenshot({
    animations: 'disabled',
    path: `${evidence}/${name}.png`,
    fullPage: (await page.locator('.ui-modal').count()) === 0,
  });
}
try {
  await page.goto(`${baseURL}/explorer`);
  await page.locator('.map-node').first().waitFor();
  await settle();
  assert.equal(await page.locator('html').getAttribute('dir'), 'rtl');
  assert.equal(await page.locator('.map-region').count(), 14);
  assert.equal(await page.getByTestId('result-count').textContent(), '140 سجلًا مطابقًا');
  checks.push('Production route, Arabic default, original paths and published-only source counts');
  await screenshot('production-ar-light');
  await page.getByRole('button', { name: 'Switch to English', exact: true }).click();
  await page.getByRole('button', { name: 'Inspect Damascus — 55 records', exact: true }).click();
  await screenshot('production-context-en-light');
  await page.getByRole('button', { name: 'Layers & legend', exact: true }).click();
  await page.getByRole('switch', { name: 'Distribution / zero matches', exact: true }).click();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Appearance', exact: true }).click();
  await page.getByRole('button', { name: 'Dark', exact: true }).click();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Switch to Arabic', exact: true }).click();
  await screenshot('production-ar-dark');
  for (const width of [390, 768]) {
    await page.setViewportSize({ width, height: 950 });
    await page.locator('.geo-mobile-context button').click();
    await screenshot(`production-context-${width}-ar-dark`);
    await page.keyboard.press('Escape');
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  checks.push(
    'Interactive context, distribution layer and bilingual light/dark production rendering',
  );
  await page.getByRole('button', { name: 'Switch to English', exact: true }).click();
  await page.getByRole('button', { name: 'Matching records', exact: true }).click();
  assert.deepEqual(
    await page.locator('.geo-record-id>bdi').allTextContents(),
    records
      .filter((r) => r.status === 'published')
      .slice(0, 25)
      .map((r) => r.rid),
  );
  checks.push('Rendered research identifiers match published source records exactly');
  await page.goto(`${baseURL}/explorer?gov=DAM&yr=2023`);
  await page.locator('.map-node').first().waitFor();
  await settle();
  const expected = records.filter(
    (r) => r.status === 'published' && r.gov === 'DAM' && r.year === 2023,
  ).length;
  assert.equal(
    await page.getByTestId('result-count').textContent(),
    `${expected} matching records`,
  );
  checks.push('Direct production deep-link query hydration and source-count parity');
  assert.equal(await page.locator('.dev-link').count(), 0);
  await page.goto(`${baseURL}/dev/design-system`);
  await page.getByText('This page is not available', { exact: true }).waitFor();
  checks.push('Development showcase excluded from production navigation and routing');
  assert.deepEqual(errors, []);
  checks.push('No runtime or console errors');
  writeFileSync(
    `${evidence}/production-results.json`,
    JSON.stringify({ passed: true, baseURL, checks, errors }, null, 2),
  );
  console.log(JSON.stringify({ passed: true, checks: checks.length, errors }));
} catch (error) {
  writeFileSync(
    `${evidence}/production-results.json`,
    JSON.stringify({ passed: false, checks, errors, error: String(error) }, null, 2),
  );
  throw error;
} finally {
  await browser.close();
}
