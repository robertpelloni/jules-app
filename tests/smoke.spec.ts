import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Jules/);
});

test('shows api key dialog on first load', async ({ page }) => {
  await page.goto('/');

  // Expect the API Key dialog to be visible
  await expect(page.getByRole('heading', { name: 'API Key Required' })).toBeVisible();
  await expect(page.getByText('Enter your Jules API key to start a session.')).toBeVisible();
});
