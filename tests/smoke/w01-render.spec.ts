import { test, expect } from '@playwright/test';
import { monitor } from '../../helpers/diagnostics';
test('W01: widget returns HTTP success and renders visible UI', async ({ page }, info) => {
  const d = monitor(page);
  try {
    const response = await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    expect(response, 'Navigation response').not.toBeNull();
    expect(response!.status(), 'Website HTTP status').toBeLessThan(400);
    await expect(page.locator('body')).toBeVisible();
    await expect.poll(async () => (await page.locator('body').innerText()).trim().length, { timeout: 20000 }).toBeGreaterThan(0);
    await expect.poll(() => page.locator('button:visible,input:visible,[role="button"]:visible').count()).toBeGreaterThan(0);
  } finally { await d.attach(page, info); }
});
test('W02: no uncaught JavaScript errors on initial render', async ({ page }, info) => {
  const d = monitor(page);
  try {
    const response = await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    expect(response?.status()).toBeLessThan(400);
    await page.waitForTimeout(1500);
    expect(d.errors, 'Uncaught application JS exceptions').toEqual([]);
  } finally { await d.attach(page, info); }
});
