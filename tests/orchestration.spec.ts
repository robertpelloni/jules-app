import { test, expect } from '@playwright/test';

test.describe('Agent Orchestration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to root
    await page.goto('/');

    // Check if the login form is present by looking for the API key input
    const keyInput = page.getByPlaceholder('Google Jules API Key');
    if (await keyInput.isVisible({ timeout: 5000 })) {
      await keyInput.fill('test-api-key-123');
      await page.getByRole('button', { name: 'Enter Workspace' }).click();
      // Wait for navigation or state change
      await page.waitForURL('**/', { timeout: 10000 });
    }
  });

  test('can create a new session', async ({ page }) => {
    // Wait for the "New Session" button to appear.
    // We use the reliable data-testid added to AppHeader
    const newSessionBtn = page.getByTestId('new-session-btn');
    await newSessionBtn.waitFor({ state: 'visible', timeout: 10000 });
    await newSessionBtn.click();
    
    // Expect the creation dialog
    const dialogHeader = page.getByRole('heading', { name: 'New Coding Session' });
    await expect(dialogHeader).toBeVisible();
    
    // Fill out the form
    await page.getByPlaceholder('What should I build?').fill('Create a simple hello world script');
    
    // Intercept the API call to avoid backend dependency
    await page.route('**/api/jules/sessions', async route => {
        const json = {
            id: 'test-session-123',
            title: 'Hello World Task',
            state: 'ACTIVE',
            createTime: new Date().toISOString(),
            sourceContext: { source: 'sources/github/test/repo' }
        };
        await route.fulfill({ status: 201, contentType: 'application/json', json });
    });

    // Intercept list sessions to include the new one
    await page.route('**/api/jules/sessions?*', async route => {
         const json = {
            sessions: [{
                id: 'test-session-123',
                title: 'Hello World Task',
                state: 'ACTIVE',
                createTime: new Date().toISOString(),
                sourceContext: { source: 'sources/github/test/repo' }
            }]
        };
        await route.fulfill({ status: 200, contentType: 'application/json', json });
    });

    // Click Start Session
    const startBtn = page.getByRole('button', { name: 'Start Session' });
    await startBtn.click();

    // The dialog should close
    await expect(dialogHeader).not.toBeVisible();
  });

  test('can open supervisor settings', async ({ page }) => {
    // 1. Locate the header settings trigger using the testid
    const settingsTrigger = page.getByTestId('settings-dropdown-trigger');
    
    // Ensure it's visible before clicking
    await settingsTrigger.waitFor({ state: 'visible', timeout: 10000 });
    await settingsTrigger.click();

    // 2. Click "Settings" item in the dropdown
    const settingsItem = page.getByRole('menuitem', { name: 'Settings' });
    await settingsItem.waitFor({ state: 'visible' });
    await settingsItem.click();

    // Expect Settings Dialog to be visible
    // We check for the "Session Keeper" tab content or the dialog title
    await expect(page.getByText('Session Keeper')).toBeVisible({ timeout: 10000 });
  });
});
