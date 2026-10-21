import { test, expect } from '@playwright/test';
import { monitor } from '../../helpers/diagnostics';

test('W07: unconnected initial UI remains accessible after a reload', async ({ page }, info) => {
  const diagnostics = monitor(page);
  try {
    const first = await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    expect(first?.status()).toBeLessThan(400);
    await expect.poll(async () => (await page.locator('body').innerText()).trim().length).toBeGreaterThan(0);
    const second = await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
    expect(second?.status()).toBeLessThan(400);
    await expect.poll(async () => (await page.locator('body').innerText()).trim().length).toBeGreaterThan(0);
    await expect.poll(() => page.locator('button:visible,input:visible,[role="button"]:visible').count()).toBeGreaterThan(0);
  } finally {
    await diagnostics.attach(page, info);
  }
});
