import { test, expect } from '@playwright/test';

test.describe('Agent Orchestration', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the session cookie or localStorage if needed to bypass API key dialog
    // For now, we simulate entering the key
    await page.goto('/');
    
    // Check if dialog is present and fill it if so
    const dialog = page.getByRole('heading', { name: 'API Key Required' });
    if (await dialog.isVisible()) {
        await page.getByPlaceholder('jules_...').fill('test-api-key');
        await page.getByRole('button', { name: 'Save Key' }).click();
    }
  });

  test('can create a new session', async ({ page }) => {
    await page.getByRole('button', { name: 'New Session' }).click();
    
    // Expect the creation dialog
    await expect(page.getByRole('heading', { name: 'New Coding Session' })).toBeVisible();
    
    // Fill out the form
    await page.getByPlaceholder('What should I build?').fill('Create a simple hello world script');
    
    // We might need to mock the API response for session creation to avoid hitting real backend
    await page.route('/api/jules/sessions', async route => {
        const json = {
            id: 'test-session-123',
            title: 'Hello World Task',
            state: 'ACTIVE',
            createTime: new Date().toISOString(),
            sourceContext: { source: 'sources/github/test/repo' }
        };
        await route.fulfill({ json });
    });

    // Click Create
    await page.getByRole('button', { name: 'Start Session' }).click();

    // Should navigate to the session or show it in the list
    // This depends on UI behavior, but we expect the dialog to close
    await expect(page.getByRole('heading', { name: 'New Coding Session' })).not.toBeVisible();
  });

  test('can open supervisor settings', async ({ page }) => {
    // Click user avatar or settings trigger
    // Assuming there is a way to get to settings. 
    // Based on components, there is a SettingsDialog.
    
    // Check for settings button in sidebar or header
    const settingsBtn = page.locator('button').filter({ hasText: 'Settings' }).first();
    // Fallback if not text
    if (!await settingsBtn.isVisible()) {
        // Try finding by icon or aria-label
        await page.getByRole('button', { name: 'Settings' }).click();
    } else {
        await settingsBtn.click();
    }

    // Expect Supervisor settings to be available
    await expect(page.getByText('Session Keeper')).toBeVisible();
  });
});
