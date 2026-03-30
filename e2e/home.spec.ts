import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('loads and shows start button', async ({ page }) => {
    await page.goto('/breathing-app/');
    await expect(page).toHaveTitle(/4-7-8 Breathing/i);
    // Begin is a <button>, not a link
    const startBtn = page.getByRole('button', { name: /begin/i });
    await expect(startBtn).toBeVisible();
  });

  test('navigates to setup page', async ({ page }) => {
    await page.goto('/breathing-app/');
    // "Setup" is the nav link label in Nav.tsx
    await page.getByRole('link', { name: /^setup$/i }).click();
    await expect(page).toHaveURL(/\/setup/);
  });
});
