import { test, expect } from '@playwright/test';

test('renders dashboard, checks for title and key elements, and monitors for console errors', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  await page.goto('/');

  // Check for the main title
  await expect(page.getByRole('heading', { name: 'Business Intelligence' })).toBeVisible({ timeout: 15000 });

  // Assert that there were no console errors
  expect(consoleErrors).toHaveLength(0);
});
