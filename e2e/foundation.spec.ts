import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
const evidence = 'docs/evidence/phase-3/foundation-regression';
async function english(page: Page) {
  const control = page.getByRole('button', { name: /^Switch to (English|Arabic)$/ });
  await control.waitFor();
  if ((await control.getAttribute('aria-label')) === 'Switch to English') await control.click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
}
async function appearance(page: Page, value: 'Light' | 'Dark' | 'System') {
  await page.getByRole('button', { name: 'Appearance', exact: true }).click();
  await page.getByRole('button', { name: value, exact: true }).click();
  await page.keyboard.press('Escape');
}
async function settle(page: Page) {
  await page.locator('main h1').waitFor({ state: 'attached' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(
    () =>
      document
        .getAnimations()
        .every((a) => a.playState !== 'running' || a.effect?.getTiming().iterations === Infinity),
    {},
    { timeout: 4000 },
  );
}
async function capture(page: Page, name: string) {
  await settle(page);
  await page.screenshot({
    animations: 'disabled',
    path: `${evidence}/${name}.png`,
    fullPage: (await page.locator('.ui-modal').count()) === 0,
  });
}
test.beforeAll(() => mkdirSync(evidence, { recursive: true }));
const runtimeErrors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  runtimeErrors.set(page, errors);
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
});
test.afterEach(async ({ page }) => {
  expect(runtimeErrors.get(page) || [], 'No browser runtime or console errors').toEqual([]);
});

test('Arabic default and real routes without pretend content', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page).toHaveURL(/explorer/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('المستكشف الجغرافي');
  await expect(page.locator('.geo-map')).toBeVisible();
  await expect(page.locator('.map-node')).toHaveCount(13);
  await capture(page, '01-explorer-ar-light');
  await english(page);
  await page
    .getByRole('navigation', { name: 'Primary navigation', exact: true })
    .getByRole('link', { name: 'Research Operations', exact: true })
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Research Operations');
  await page
    .getByRole('navigation', { name: 'Primary navigation', exact: true })
    .getByRole('link', { name: 'Research Insights', exact: true })
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Research Insights');
  await expect(
    page.getByText('No metrics or charts are simulated in this preview.', { exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test('canonical context survives routes refresh back and forward', async ({ page }) => {
  await page.goto('/explorer');
  await english(page);
  await page.getByRole('button', { name: 'Set research context', exact: true }).first().click();
  const drawer = page.getByRole('dialog', { name: 'Filters', exact: true });
  await drawer.getByLabel('Governorate', { exact: true }).selectOption('DAM');
  await drawer.getByLabel('Search text', { exact: true }).fill('Water المياه');
  await drawer.getByRole('button', { name: 'Done', exact: true }).click();
  await expect(page).toHaveURL(/gov=DAM/);
  await page
    .getByRole('navigation', { name: 'Primary navigation', exact: true })
    .getByRole('link', { name: 'Research Operations', exact: true })
    .click();
  await expect(page).toHaveURL(/research\?.*gov=DAM/);
  await page
    .getByRole('navigation', { name: 'Primary navigation', exact: true })
    .getByRole('link', { name: 'Research Insights', exact: true })
    .click();
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Research Operations');
  await expect(page.getByText('Water المياه', { exact: true })).toBeVisible();
  await page.goForward();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Research Insights');
  await page.reload();
  await expect(page.getByText('Damascus', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Clear context: Governorate', exact: true }).click();
  await expect(page).not.toHaveURL(/gov=/);
  await expect(page.getByText('Water المياه', { exact: true })).toBeVisible();
});
test('system theme and explicit override persist without a wrong-theme first render', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/explorer');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await english(page);
  await appearance(page, 'Light');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await appearance(page, 'System');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});
test('locale roundtrip keeps context and explicit dark theme', async ({ page }) => {
  await page.goto('/explorer?q=Water');
  await english(page);
  await appearance(page, 'Dark');
  await capture(page, '03-explorer-en-dark');
  await page.getByRole('button', { name: 'Switch to Arabic', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('المستكشف الجغرافي');
  await expect(page.getByText('Water', { exact: true })).toBeVisible();
  await capture(page, '04-explorer-ar-dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});
test('showcase form validation and native selection', async ({ page }) => {
  await page.goto('/dev/design-system');
  await english(page);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.getByRole('button', { name: 'Validate specimen', exact: true }).click();
  const input = page.getByLabel('Research title', { exact: true });
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(input).toBeFocused();
  await input.fill('Sample عنوان');
  await page.getByRole('button', { name: 'Validate specimen', exact: true }).click();
  await expect(input).not.toHaveAttribute('aria-invalid', 'true');
  const checkbox = page.getByRole('checkbox');
  await expect(checkbox).toBeChecked();
  await checkbox.uncheck();
  await expect(checkbox).not.toBeChecked();
  const toggle = page.getByRole('switch');
  await toggle.focus();
  await page.keyboard.press('Space');
  await expect(toggle).toHaveAttribute('aria-checked', 'true');
});
test('dialog and drawer trap focus restore origin and respect direction', async ({ page }) => {
  await page.goto('/dev/design-system');
  await english(page);
  const trigger = page.getByRole('button', { name: 'Open dialog', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate((e) => e.contains(document.activeElement))).toBe(true);
  }
  await capture(page, '05-showcase-dialog-en');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await page.getByRole('button', { name: 'Open contextual drawer', exact: true }).click();
  const drawer = page.locator('.ui-drawer');
  await expect(drawer).toHaveAttribute('dir', 'ltr');
  const ltr = await drawer.boundingBox();
  expect(ltr!.x).toBeGreaterThan(0);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Switch to Arabic', exact: true }).click();
  await page.getByRole('button', { name: 'افتح اللوحة السياقية', exact: true }).click();
  await expect(drawer).toHaveAttribute('dir', 'rtl');
  await expect.poll(async () => Math.round((await drawer.boundingBox())!.x)).toBe(0);
  await capture(page, '06-showcase-drawer-ar');
  await page.keyboard.press('Escape');
});
test('popover tabs disclosure and notification are interactive', async ({ page }) => {
  await page.goto('/dev/design-system');
  await english(page);
  await page.getByRole('button', { name: 'Inspect context', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('tab', { name: 'Behavior', exact: true }).click();
  await expect(page.getByRole('tab', { name: 'Behavior', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await page.getByText('Progressive disclosure', { exact: true }).click();
  await expect(page.locator('details[open]')).toBeVisible();
  await page.getByRole('button', { name: 'Show notification', exact: true }).click();
  await expect(page.locator('.ui-toast')).toBeVisible();
});
for (const width of [390, 768, 1280, 1920])
  test(`responsive navigation and no horizontal overflow at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/explorer');
    await english(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    if (width < 960) {
      await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
      await page
        .getByRole('dialog')
        .getByRole('link', { name: 'Research Operations', exact: true })
        .click();
      await expect(page.getByRole('dialog')).not.toBeVisible();
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Research Operations');
    } else {
      await page.getByRole('button', { name: 'Collapse navigation', exact: true }).click();
      await expect(page.locator('.app-shell')).toHaveClass(/rail-is-collapsed/);
      await page.getByRole('button', { name: 'Expand navigation', exact: true }).click();
    }
    await capture(page, `responsive-${width}-en-light`);
    await page.goto('/dev/design-system');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
test('reduced motion disables transitions and animated specimens', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/dev/design-system');
  const timings = await page.locator('.spec-motion-sample').evaluate((e) => ({
    transition: getComputedStyle(e).transitionDuration,
    animation: getComputedStyle(e).animationDuration,
  }));
  expect(parseFloat(timings.animation)).toBeLessThan(0.001);
  expect(parseFloat(timings.transition)).toBeLessThan(0.001);
});
test('support routes stay honest placeholders and deep-link errors recover', async ({ page }) => {
  await page.goto('/governance/queue');
  await english(page);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Review queue');
  await expect(
    page.getByText('This is a navigation and layout preview; no governance action is performed.', {
      exact: true,
    }),
  ).toBeVisible();
  await page.goto('/not-a-workspace');
  await expect(page.getByText('This page is not available', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Return to Explorer', exact: true }).click();
  await expect(page).toHaveURL(/explorer/);
});
test('automated WCAG checks on shell showcase and open overlays in both themes', async ({
  page,
}) => {
  test.setTimeout(90000);
  const reports = [];
  for (const theme of ['light', 'dark']) {
    await page.goto('/explorer');
    await english(page);
    await appearance(page, theme === 'light' ? 'Light' : 'Dark');
    for (const route of ['/explorer', '/dev/design-system']) {
      await page.goto(route);
      await settle(page);
      const r = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      reports.push({ route, theme, violations: r.violations });
      expect.soft(r.violations, `${route} ${theme}`).toEqual([]);
    }
    await page.getByRole('button', { name: 'Open dialog', exact: true }).click();
    await settle(page);
    const r = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    reports.push({ route: 'dialog', theme, violations: r.violations });
    expect.soft(r.violations, `dialog ${theme}`).toEqual([]);
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Switch to Arabic', exact: true }).click();
    for (const route of ['/explorer', '/dev/design-system']) {
      await page.goto(route);
      await settle(page);
      const ar = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      reports.push({ route: `${route} Arabic`, theme, violations: ar.violations });
      expect.soft(ar.violations, `${route} ${theme} Arabic`).toEqual([]);
    }
  }
  writeFileSync(`${evidence}/accessibility-results.json`, JSON.stringify(reports, null, 2));
});

test('prototype hash links migrate once to canonical query', async ({ page }) => {
  await page.goto('/#gov=DAM&q=Water');
  await expect(page).toHaveURL(/explorer\?.*gov=DAM/);
  await expect(page).not.toHaveURL(/#/);
  await expect(page.getByText('Water', { exact: true })).toBeVisible();
});
