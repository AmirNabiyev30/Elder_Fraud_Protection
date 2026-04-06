import { test, expect } from '@playwright/test';

test('shows name error for invalid name', async ({ page }) => {
  await page.goto('/sign-up');

  await page.fill('[data-testid="full-name-input"]', 'John123');
  await page.fill('[data-testid="email-input"]', 'john@example.com');
  await page.fill('[data-testid="phone-input"]', '1234567890');
  await page.fill('[data-testid="password-input"]', 'password123');
  await page.fill('[data-testid="confirm-password-input"]', 'password123');

  await page.click('text=Continue');

  await expect(page.locator('[data-testid="name-error"]')).not.toHaveClass('hidden');
});

test('successful signup with valid inputs', async ({ page }) => {
  let loggedData;
  page.on('console', async msg => {
    if (msg.type() === 'log') {
      loggedData = await msg.args()[0].jsonValue();
    }
  });

  await page.goto('/sign-up');

  await page.fill('[data-testid="full-name-input"]', 'John Doe');
  await page.fill('[data-testid="email-input"]', 'john@example.com');
  await page.fill('[data-testid="phone-input"]', '1234567890');
  await page.fill('[data-testid="password-input"]', 'password123');
  await page.fill('[data-testid="confirm-password-input"]', 'password123');

  await page.click('text=Continue');

  await expect(loggedData).toEqual({
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890',
    password: 'password123'
  });
});

test('sign in link navigates to login page', async ({ page }) => {
  await page.goto('/sign-up');
  await page.click('[data-testid="signin-link"]');
  await expect(page).toHaveURL('/login');
});