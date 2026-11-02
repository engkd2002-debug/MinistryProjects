import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import projects from '../src/data/demo/projects.json' with { type: 'json' };
const evidence = 'docs/evidence/phase-3';
async function english(page: Page) {
  const b = page.getByRole('button', { name: /^Switch to (English|Arabic)$/ });
  await b.waitFor();
  if ((await b.getAttribute('aria-label')) === 'Switch to English') await b.click();
}
async function start(page: Page, path = '/explorer') {
  await page.goto(path);
  await english(page);
  await expect(page.getByTestId('result-count')).not.toHaveText('—');
  await stable(page);
}
async function stable(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(
    () =>
      document
        .getAnimations()
        .every((a) => a.playState !== 'running' || a.effect?.getTiming().iterations === Infinity),
    {},
    { timeout: 4000 },
  );
  if (await page.locator('.geo-map').count())
    await expect(page.locator('.geo-map')).toHaveAttribute('data-moving', 'false');
}
async function view(page: Page) {
  return (await page.locator('.geo-map').getAttribute('viewBox'))!.split(' ').map(Number);
}
async function appearance(page: Page, value: 'Light' | 'Dark') {
  await page.getByRole('button', { name: 'Appearance', exact: true }).click();
  await page.getByRole('button', { name: value, exact: true }).click();
  await page.keyboard.press('Escape');
}
async function shot(page: Page, name: string) {
  await stable(page);
  await page.screenshot({
    animations: 'disabled',
    path: `${evidence}/${name}.png`,
    fullPage: !(await page.locator('.ui-modal').count()),
  });
}
async function filters(page: Page) {
  await page.getByRole('button', { name: /^Filters/ }).click();
  return page.getByRole('dialog', { name: 'Filters', exact: true });
}
async function settings(page: Page) {
  await page.getByRole('button', { name: 'Layers & legend', exact: true }).click();
  return page.getByRole('dialog', { name: 'Map visualization', exact: true });
}
test.beforeAll(() => mkdirSync(evidence, { recursive: true }));
const errors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const list: string[] = [];
  errors.set(page, list);
  page.on('pageerror', (e) => list.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') list.push(m.text());
  });
});
test.afterEach(async ({ page }) =>
  expect(errors.get(page), 'No runtime or console errors').toEqual([]),
);

test('original boundaries, keyboard selection and scoped reset behavior', async ({ page }) => {
  await start(page);
  await expect(page.locator('.map-region')).toHaveCount(14);
  await expect(page.locator('.map-node')).toHaveCount(13);
  await expect(page.getByTestId('result-count')).toHaveText('140 matching records');
  const dam = page.locator('[data-governorate="DAM"]');
  await dam.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/gov=DAM/);
  await expect(dam).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('result-count')).toHaveText('55 matching records');
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await stable(page);
  await page.getByRole('button', { name: 'Reset map view', exact: true }).click();
  await stable(page);
  expect(await view(page)).toEqual([-20, -20, 1040, 958]);
  await expect(page).toHaveURL(/gov=DAM/);
  await page.locator('.geo-map').click({ position: { x: 10, y: 250 } });
  await expect(page).not.toHaveURL(/gov=/);
  await expect(page.getByTestId('result-count')).toHaveText('140 matching records');
  await shot(page, '01-explorer-en-light');
});
test('zoom levels, wheel anchor, pointer pan and keyboard Home are functional', async ({
  page,
}) => {
  await start(page);
  const map = page.locator('.geo-map');
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await stable(page);
  await expect(map).toHaveAttribute('data-level', '1');
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await stable(page);
  await expect(map).toHaveAttribute('data-level', '2');
  await page.getByRole('button', { name: 'Zoom out', exact: true }).click();
  await stable(page);
  await expect(map).toHaveAttribute('data-level', '1');
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await stable(page);
  await expect(page.locator('.map-reference-label')).toHaveCount(14);
  const before = await view(page);
  const box = (await map.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.48, box.y + box.height * 0.55);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.48 + 70, box.y + box.height * 0.55 + 35, {
    steps: 5,
  });
  await page.mouse.up();
  await stable(page);
  const panned = await view(page);
  expect(panned[0]).toBeLessThan(before[0]);
  expect(panned[1]).toBeLessThan(before[1]);
  expect(panned[2]).toBe(before[2]);
  await expect(page).not.toHaveURL(/gov=/);
  await map.focus();
  await page.keyboard.press('ArrowRight');
  await stable(page);
  expect((await view(page))[0]).toBeGreaterThan(panned[0]);
  await page.keyboard.press('Home');
  await stable(page);
  expect(await view(page)).toEqual([-20, -20, 1040, 958]);
  const client = { x: box.x + box.width * 0.4, y: box.y + box.height * 0.4 };
  const point = async () =>
    map.evaluate((svg, p) => {
      const m = (svg as SVGSVGElement).getScreenCTM()!;
      const v = new DOMPoint(p.x, p.y).matrixTransform(m.inverse());
      return { x: v.x, y: v.y };
    }, client);
  const anchor = await point();
  await page.mouse.move(client.x, client.y);
  await page.mouse.wheel(0, -120);
  await stable(page);
  const after = await point();
  expect(Math.abs(after.x - anchor.x)).toBeLessThan(1);
  expect(Math.abs(after.y - anchor.y)).toBeLessThan(1);
  expect((await view(page))[2]).toBe(832);
});
test('bubble inspection does not filter until explicit record drill-down', async ({ page }) => {
  await start(page);
  await page.getByRole('button', { name: 'Inspect Aleppo — 25 records', exact: true }).click();
  await expect(page).not.toHaveURL(/gov=/);
  const context = page.locator('.geo-context-rail');
  await expect(context.getByRole('heading', { name: 'Aleppo', exact: true })).toBeVisible();
  await expect(context.locator('.geo-context-count strong')).toHaveText('25');
  await page.keyboard.press('Escape');
  await expect(
    context.getByRole('heading', { name: 'Select a location', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Inspect Aleppo — 25 records', exact: true }).click();
  await context.getByRole('button', { name: 'Show matching records', exact: true }).click();
  await expect(page).toHaveURL(/gov=ALE/);
  await expect(page.locator('.geo-record-card')).toHaveCount(25);
  await page.locator('.geo-record-card').first().click();
  const preview = page.getByRole('dialog', { name: 'Research preview', exact: true });
  await expect(preview).toBeVisible();
  await expect(preview.locator('article h2')).toBeVisible();
  const word = preview.locator('.geo-keywords button').first();
  const text = await word.textContent();
  await word.click();
  await expect(preview).not.toBeVisible();
  expect(new URL(page.url()).searchParams.get('kw')).toBe(text);
});
test('city drill-down and individual source record markers open guarded previews', async ({
  page,
}) => {
  await start(page, '/explorer?gov=DAM');
  await page
    .locator('.geo-context-rail')
    .getByRole('button', { name: 'Zoom to this location', exact: true })
    .click();
  await stable(page);
  await expect(page.locator('.geo-map')).toHaveAttribute('data-level', '2');
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await stable(page);
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await stable(page);
  await expect(page.locator('.geo-map')).toHaveAttribute('data-level', '3');
  const marker = page.locator('.map-record-marker[tabindex="0"]').first();
  const id = await marker.getAttribute('data-record-id');
  expect(projects.find((r) => String(r.id) === id)?.status).toBe('published');
  await marker.focus();
  await page.keyboard.press('Enter');
  const preview = page.getByRole('dialog', { name: 'Research preview', exact: true });
  await expect(preview).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(preview).not.toBeVisible();
  await expect(marker).toBeFocused();
  await shot(page, '02-record-level-en-light');
});
test('connected facets, multi-years and validated range never disagree with URL or counts', async ({
  page,
}) => {
  await start(page);
  const d = await filters(page);
  await d.getByLabel('Governorate', { exact: true }).selectOption('DAM');
  await d.getByRole('button', { name: '2023', exact: true }).click();
  await d.getByRole('button', { name: '2024', exact: true }).click();
  await d.getByText('Year range', { exact: true }).click();
  await d.getByLabel('From year', { exact: true }).fill('2025');
  await d.getByLabel('To year', { exact: true }).fill('2020');
  await d.getByRole('button', { name: 'Apply range', exact: true }).click();
  await expect(d.getByRole('alert')).toBeVisible();
  expect(new URL(page.url()).searchParams.has('yf')).toBe(false);
  await d.getByLabel('From year', { exact: true }).fill('2023');
  await d.getByLabel('To year', { exact: true }).fill('2023');
  await d.getByRole('button', { name: 'Apply range', exact: true }).click();
  await expect(d.getByRole('alert')).not.toBeVisible();
  await d.getByRole('button', { name: 'Done', exact: true }).click();
  const expected = projects.filter(
    (r) => r.status === 'published' && r.gov === 'DAM' && r.year === 2023,
  ).length;
  await expect(page.getByTestId('result-count')).toHaveText(`${expected} matching records`);
  await page.getByRole('button', { name: 'Matching records', exact: true }).click();
  await expect(page.locator('.geo-record-card')).toHaveCount(expected);
  const d2 = await filters(page);
  await d2.getByLabel('Researcher / co-researcher', { exact: true }).fill('IMPOSSIBLE_RESEARCHER');
  await d2.getByRole('button', { name: 'Done', exact: true }).click();
  await expect(page.getByTestId('result-count')).toHaveText('0 matching records');
  await page
    .getByRole('button', { name: 'Clear context: Researcher / co-researcher', exact: true })
    .click();
  await expect(page.getByTestId('result-count')).toHaveText(`${expected} matching records`);
});
test('query and viewport survive workspace navigation; locale does not change matches', async ({
  page,
}) => {
  await start(page, '/explorer?q=Damascus');
  const before = await page.getByTestId('result-count').textContent();
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await stable(page);
  const extent = await view(page);
  await page
    .getByRole('navigation', { name: 'Primary navigation', exact: true })
    .getByRole('link', { name: 'Research Operations', exact: true })
    .click();
  await expect(page).toHaveURL(/research\?q=Damascus/);
  await page
    .getByRole('navigation', { name: 'Primary navigation', exact: true })
    .getByRole('link', { name: 'Geographic Explorer', exact: true })
    .click();
  await stable(page);
  expect(await view(page)).toEqual(extent);
  await expect(page.getByTestId('result-count')).toHaveText(before!);
  await page.getByRole('button', { name: 'Switch to Arabic', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByTestId('result-count')).toContainText(before!.split(' ')[0]);
  await page.reload();
  await expect(page.locator('.query-context')).toContainText('Damascus');
  await expect(page.locator('.geo-map')).toHaveAttribute('data-level', '1');
});
test('all supported overlays, inferred link table and color validation are interactive', async ({
  page,
}) => {
  await start(page);
  const d = await settings(page);
  for (const name of ['Concentration', 'Distribution / zero matches', 'Shared-name links'])
    await d.getByRole('switch', { name, exact: true }).click();
  await d.getByText('Edit color thresholds', { exact: true }).click();
  await d.getByLabel('Second color starts at').fill('20');
  await d.getByLabel('Third color starts at').fill('10');
  await d.getByRole('button', { name: 'Apply thresholds', exact: true }).click();
  await expect(d.getByRole('alert')).toBeVisible();
  await d.getByLabel('Second color starts at').fill('5');
  await d.getByLabel('Third color starts at').fill('10');
  await d.getByLabel('Fourth color starts at').fill('20');
  await d.getByRole('button', { name: 'Apply thresholds', exact: true }).click();
  await expect(d.getByRole('alert')).not.toBeVisible();
  await d.getByText('Inferred links in this map', { exact: true }).click();
  expect(await d.locator('tbody tr').count()).toBeGreaterThan(0);
  expect(await d.locator('tbody tr').count()).toBeLessThanOrEqual(15);
  await page.keyboard.press('Escape');
  await expect(page.locator('.map-heat')).toBeVisible();
  expect(await page.locator('.map-link').count()).toBeGreaterThan(0);
  expect(await page.locator('.map-region[style*="empty"]').count()).toBe(1);
  await shot(page, '03-layers-en-light');
  await appearance(page, 'Dark');
  await shot(page, '04-layers-en-dark');
});
test('demo visibility is explicit and never leaks unpublished map records to viewer', async ({
  page,
}) => {
  await start(page);
  const d = await settings(page);
  await d.locator('summary').filter({ hasText: 'Demo visibility' }).click();
  await expect(d.getByText(/not authentication or production authorization/)).toBeVisible();
  await d.getByLabel('Demo visibility', { exact: true }).selectOption('admin');
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('result-count')).toHaveText('150 matching records');
  await page.reload();
  await english(page);
  await expect(page.getByTestId('result-count')).toHaveText('150 matching records');
  const d2 = await settings(page);
  await d2.locator('summary').filter({ hasText: 'Demo visibility' }).click();
  await d2.getByLabel('Demo visibility', { exact: true }).selectOption('viewer');
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('result-count')).toHaveText('140 matching records');
  await page.getByRole('button', { name: 'Matching records', exact: true }).click();
  for (const reference of projects.filter((r) => r.status !== 'published').map((r) => r.rid))
    await expect(
      page.locator('.geo-record-id>bdi').getByText(reference, { exact: true }),
    ).toHaveCount(0);
});
test('empty, unavailable and incomplete locations are distinct and recover safely', async ({
  page,
}) => {
  await start(page, '/explorer?q=IMPOSSIBLE_MATCH');
  await expect(page.getByTestId('result-count')).toHaveText('0 matching records');
  await expect(page.locator('.geo-map-empty')).toContainText('does not establish an absence');
  await expect(page.locator('.map-node')).toHaveCount(0);
  await shot(page, '05-empty-en-light');
  await page.evaluate(() => localStorage.setItem('snrp.snapshot.v1', 'corrupt'));
  await page.reload();
  await english(page);
  await expect(page.getByRole('alert')).toContainText('Research data unavailable');
  await expect(page.getByTestId('result-count')).toHaveText('—');
  await expect(page.locator('.map-region[style*="unknown"]')).toHaveCount(14);
  expect(await page.evaluate(() => localStorage.getItem('snrp.snapshot.v1'))).toBe('corrupt');
  await shot(page, '06-unavailable-en-light');
  await page.evaluate(() => localStorage.removeItem('snrp.snapshot.v1'));
  await page.getByRole('button', { name: 'Retry loading', exact: true }).click();
  await expect(page.getByTestId('result-count')).toHaveText('0 matching records');
  await page.getByRole('button', { name: 'Clear all filters', exact: true }).click();
  await expect(page.getByTestId('result-count')).toHaveText('140 matching records');
  const input = { ...projects[0], status: 'published', city: 'Unregistered city' };
  await page.evaluate(
    (raw) =>
      localStorage.setItem(
        'snrp.snapshot.v1',
        JSON.stringify({
          schemaVersion: 1,
          revision: 1,
          savedAt: new Date().toISOString(),
          fixtureVersion: 'test-only',
          synthetic: true,
          records: [raw],
        }),
      ),
    input,
  );
  await page.reload();
  await english(page);
  await expect(page.getByTestId('result-count')).toHaveText('1 matching records');
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await stable(page);
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await stable(page);
  await expect(page.locator('.map-node')).toHaveCount(0);
  await expect(
    page.getByRole('status').filter({ hasText: '1 without a usable location' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Matching records', exact: true }).first().click();
  await expect(page.locator('.geo-record-card')).toHaveCount(1);
  await expect(page.locator('.geo-record-card')).toContainText('No usable point');
});
test('reduced motion, directional controls and keyboard focus remain usable after dragging', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await start(page);
  const map = page.locator('.geo-map');
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await expect(map).toHaveAttribute('data-moving', 'false');
  await page.locator('.geo-direction-controls summary').click();
  await page.getByRole('button', { name: 'Pan east', exact: true }).click();
  const panned = await view(page);
  expect(panned[0]).toBeGreaterThan(0);
  await map.focus();
  await page.keyboard.press('Home');
  await expect(map).toHaveAttribute('viewBox', '-20 -20 1040 958');
  const box = (await map.boundingBox())!;
  await page.mouse.move(box.x + 50, box.y + 250);
  await page.mouse.down();
  await page.mouse.move(box.x + 65, box.y + 255);
  await page.mouse.up();
  const gov = page.locator('[data-governorate="ALE"]');
  await gov.focus();
  await page.keyboard.press('Space');
  await expect(page).toHaveURL(/gov=ALE/);
  const d = await filters(page);
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab');
    expect(await d.evaluate((e) => e.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: /^Filters/ })).toBeFocused();
});
for (const width of [390, 768, 1280, 1920])
  test(`responsive map and panels at ${width}, both directions and themes`, async ({ page }) => {
    await page.setViewportSize({ width, height: 950 });
    await start(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await shot(page, `responsive-${width}-en-light`);
    if (width < 1200) {
      await page.getByRole('button', { name: /^Inspect Aleppo/ }).click();
      const d = page.getByRole('dialog', { name: 'Location context', exact: true });
      await expect(d).toBeVisible();
      await shot(page, `context-${width}-en-light`);
      await d.getByRole('button', { name: 'Zoom to this location', exact: true }).click();
      await expect(d).not.toBeVisible();
      await stable(page);
    }
    await appearance(page, 'Dark');
    await page.getByRole('button', { name: 'Switch to Arabic', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await shot(page, `responsive-${width}-ar-dark`);
    await page.getByRole('button', { name: /^المرشحات/ }).click();
    const d = page.getByRole('dialog', { name: 'المرشحات', exact: true });
    await expect(d).toHaveAttribute('dir', 'rtl');
    expect(await d.evaluate((e) => e.scrollWidth <= e.clientWidth)).toBe(true);
    await page.keyboard.press('Escape');
  });
test('resizing preserves inspection without unexpectedly opening a context modal', async ({
  page,
}) => {
  await start(page);
  await page.getByRole('button', { name: 'Inspect Aleppo — 25 records', exact: true }).click();
  await page.setViewportSize({ width: 390, height: 950 });
  await stable(page);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('.geo-mobile-context button')).toHaveText('Aleppo');
  await page.locator('.geo-mobile-context button').click();
  await expect(page.getByRole('dialog', { name: 'Location context', exact: true })).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await stable(page);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('.geo-context-rail h2')).toHaveText('Aleppo');
  await page.setViewportSize({ width: 768, height: 950 });
  await stable(page);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('.geo-mobile-context button')).toHaveText('Aleppo');
});
test('clipboard rejection is reported honestly', async ({ page }) => {
  await start(page);
  await page.evaluate(() =>
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error('denied')) },
    }),
  );
  await page.getByRole('button', { name: 'Copy filtered link', exact: true }).click();
  await expect(page.locator('.ui-toast')).toContainText('Could not copy');
});

test('all exact facet controls, category values and paged records use source data', async ({
  page,
}) => {
  await start(page);
  const record = projects.find((r) => r.status === 'published')!;
  const fields = [
    ['Governorate', 'gov'],
    ['City', 'city'],
    ['University', 'uni'],
    ['Specialty', 'spec'],
    ['Branch', 'branch'],
    ['Research type', 'type'],
  ] as const;
  for (const [label, key] of fields) {
    const d = await filters(page);
    await d.getByLabel(label, { exact: true }).selectOption(String(record[key]));
    await d.getByRole('button', { name: 'Done', exact: true }).click();
    const expected = projects.filter(
      (r) => r.status === 'published' && r[key] === record[key],
    ).length;
    await expect(page.getByTestId('result-count')).toHaveText(`${expected} matching records`);
    const reset = await filters(page);
    await reset.getByRole('button', { name: 'Clear all filters', exact: true }).click();
    await reset.getByRole('button', { name: 'Done', exact: true }).click();
  }
  const d = await filters(page);
  await d.locator('summary').filter({ hasText: 'Category' }).click();
  await d.getByLabel('Category', { exact: true }).selectOption('year');
  await d.getByLabel('All values', { exact: true }).selectOption(String(record.year));
  await d.getByRole('button', { name: 'Done', exact: true }).click();
  await expect(page.getByTestId('result-count')).toHaveText(
    `${projects.filter((r) => r.status === 'published' && r.year === record.year).length} matching records`,
  );
  await page.reload();
  await english(page);
  const hydrated = await filters(page);
  await hydrated.locator('summary').filter({ hasText: 'Category' }).click();
  await expect(hydrated.getByLabel('Category', { exact: true })).toHaveValue('year');
  await expect(hydrated.getByLabel('All values', { exact: true })).toHaveValue(String(record.year));
  await hydrated.getByRole('button', { name: 'Clear all filters', exact: true }).click();
  await hydrated.getByRole('button', { name: 'Done', exact: true }).click();
  await page.getByRole('button', { name: 'Matching records', exact: true }).click();
  await expect(page.locator('.geo-record-card')).toHaveCount(25);
  await page.getByRole('button', { name: 'Show more (115 remaining)', exact: true }).click();
  await expect(page.locator('.geo-record-card')).toHaveCount(50);
  const ids = await page.locator('.geo-record-id>bdi').allTextContents();
  expect(new Set(ids).size).toBe(50);
});

test.describe('touch input', () => {
  test.use({ hasTouch: true, isMobile: true });
  test('single-finger map pan and bubble tap are functional', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await start(page);
    const map = page.locator('.geo-map');
    await map.scrollIntoViewIfNeeded();
    const box = (await map.boundingBox())!;
    const session = await page.context().newCDPSession(page);
    const point = {
      x: Math.round(box.x + box.width * 0.45),
      y: Math.round(box.y + box.height * 0.5),
    };
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] });
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: point.x + 35, y: point.y + 25 }],
    });
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await stable(page);
    expect((await view(page))[0]).toBeLessThan(-20);
    await expect(page).not.toHaveURL(/gov=/);
    await page.getByRole('button', { name: 'Reset map view', exact: true }).tap();
    await stable(page);
    const bubble = page.getByRole('button', { name: 'Inspect Aleppo — 25 records', exact: true });
    await bubble.tap();
    await expect(page.getByRole('dialog', { name: 'Location context', exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
  });
});
test('geographic overlays and mobile context pass automated accessibility checks', async ({
  page,
}) => {
  test.setTimeout(90000);
  await start(page);
  const reports = [];
  for (const theme of ['Light', 'Dark'] as const) {
    await appearance(page, theme);
    for (const surface of ['filters', 'layers', 'preview'] as const) {
      if (surface === 'filters') await filters(page);
      else if (surface === 'layers') await settings(page);
      else {
        await page.getByRole('button', { name: 'Matching records', exact: true }).click();
        await page.locator('.geo-record-card').first().click();
      }
      await stable(page);
      const r = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      reports.push({ theme, surface, violations: r.violations });
      expect.soft(r.violations, `${theme} ${surface}`).toEqual([]);
      await page.keyboard.press('Escape');
    }
  }
  await page.getByRole('button', { name: 'Map', exact: true }).click();
  await page.setViewportSize({ width: 390, height: 900 });
  await page.getByRole('button', { name: 'Switch to Arabic', exact: true }).click();
  await page.getByRole('button', { name: /^استعراض حلب/ }).click();
  await stable(page);
  const r = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  reports.push({ theme: 'dark', surface: 'Arabic mobile context', violations: r.violations });
  expect.soft(r.violations).toEqual([]);
  writeFileSync(`${evidence}/geographic-accessibility.json`, JSON.stringify(reports, null, 2));
});
