// Capture review evidence from running dev (5173) and production preview (4173).
const { chromium } = require('playwright');
const fs = require('node:fs');
const out = 'docs/evidence/phase-2';
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
    args: ['--no-sandbox'],
  });
  const errors = [];
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    colorScheme: 'light',
  });
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  const shot = async (name) => {
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
    await page.screenshot({
      path: `${out}/${name}.png`,
      fullPage: (await page.locator('.ui-modal').count()) === 0,
    });
  };
  await page.goto('http://127.0.0.1:5173/dev/design-system');
  await page.getByRole('heading', { level: 1 }).waitFor();
  await shot('02-showcase-ar-light');
  await page.getByRole('button', { name: 'Switch to English', exact: true }).click();
  await page.getByRole('button', { name: 'Appearance', exact: true }).click();
  await page.getByRole('button', { name: 'Dark', exact: true }).click();
  await page.keyboard.press('Escape');
  await shot('07-showcase-en-dark');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:5173/explorer');
  await page.getByRole('button', { name: 'Switch to Arabic', exact: true }).click();
  await shot('08-mobile-ar-dark');
  await page.getByRole('button', { name: 'فتح التنقل', exact: true }).click();
  await page.getByRole('dialog').waitFor();
  await shot('09-mobile-navigation-ar');
  await page.keyboard.press('Escape');
  const prod = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    colorScheme: 'light',
  });
  const p = await prod.newPage();
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await p.goto('http://127.0.0.1:4173/explorer');
  await p.getByRole('heading', { level: 1, name: 'المستكشف الجغرافي' }).waitFor();
  const explorerWorks = true;
  const devLinkAbsent =
    (await p.getByRole('link', { name: 'نظام التصميم', exact: true }).count()) === 0;
  await p.goto('http://127.0.0.1:4173/dev/design-system');
  await p.getByText('هذه الصفحة غير متاحة', { exact: true }).waitFor();
  const galleryExcluded = true;
  const result = {
    recordedAt: new Date().toISOString(),
    browser: 'Chromium',
    explorerWorks,
    devLinkAbsent,
    galleryExcluded,
    runtimeErrors: errors,
    screenshotViewports: {
      desktop: { width: 1440, height: 1000 },
      mobile: { width: 390, height: 844 },
    },
  };
  fs.writeFileSync(`${out}/production-smoke.json`, JSON.stringify(result, null, 2));
  await browser.close();
  if (errors.length) throw new Error(JSON.stringify(errors));
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
