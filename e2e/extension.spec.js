const { test, expect, chromium } = require('@playwright/test');
const path = require('path');

const extensionPath = path.resolve(__dirname, '..');

test('popup opens and toggle changes status dot color', async () => {
  const context = await chromium.launchPersistentContext('', {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });

  let extensionId;
  let serviceWorker = context.serviceWorkers()[0];
  if (!serviceWorker) {
    serviceWorker = await context.waitForEvent('serviceworker');
  }
  extensionId = serviceWorker.url().split('/')[2];

  const popupPage = await context.newPage();
  await popupPage.setViewportSize({ width: 400, height: 600 });
  await popupPage.goto(`chrome-extension://${extensionId}/popup/popup.html`);

  await expect(popupPage.locator('.title')).toHaveText('Elder Fraud Protection');
  await expect(popupPage.locator('#scanButton')).toBeVisible();

  const statusDot = popupPage.locator('.status-dot');
  await expect(statusDot).toBeVisible();

  await popupPage.locator('.switch').click();
  await expect(statusDot).toHaveCSS('background-color', 'rgb(201, 201, 201)');

  await popupPage.locator('.switch').click();
  await expect(statusDot).toHaveCSS('background-color', 'rgb(39, 160, 101)');

  await context.close();
});
