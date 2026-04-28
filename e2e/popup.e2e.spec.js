const path = require('path');
const { test, expect, chromium } = require('@playwright/test');

test('popup UI renders expected elements', async () => {
  // Extensions require a persistent context and non-headless mode.
  const extensionPath = path.resolve(__dirname, '..');
  const userDataDir = path.resolve(__dirname, '..', '.playwright-user-data');

  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });

  try {
    const background =
      context.serviceWorkers()[0] || (await context.waitForEvent('serviceworker'));
    const extensionId = new URL(background.url()).host;

    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup/popup.html`);

    await expect(page.getByText('Elder Fraud Protection')).toBeVisible();
    await expect(page.locator('#scanButton')).toBeVisible();
    await expect(page.locator('#autoScanToggle')).toBeVisible();
    await expect(page.locator('.status-dot')).toBeVisible();
  } finally {
    await context.close();
  }
});

