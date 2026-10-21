import { test, expect } from '@playwright/test';
import { monitor } from '../../helpers/diagnostics';
test('W03: identify visible Widget controls without wallet interaction', async ({ page }, info) => {
  const d = monitor(page);
  try {
    const response = await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    expect(response?.status()).toBeLessThan(400);
    const controls = page.locator('button:visible,input:visible,[role="button"]:visible');
    await expect.poll(() => controls.count(), { timeout: 20000 }).toBeGreaterThan(0);
    await info.attach('control-text.json', {
      body: Buffer.from(JSON.stringify(await controls.allTextContents(), null, 2)),
      contentType: 'application/json'
    });
  } finally { await d.attach(page, info); }
});
test('W05: capture amount-input candidates without entering or spending funds', async ({ page }, info) => {
  const d = monitor(page);
  try {
    const response = await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    expect(response?.status()).toBeLessThan(400);
    const inputs = await page.locator('input:visible').evaluateAll(elements => elements.map(el => ({
      type: el.getAttribute('type'), placeholder: el.getAttribute('placeholder'),
      inputmode: el.getAttribute('inputmode'), ariaLabel: el.getAttribute('aria-label')
    })));
    await info.attach('input-candidates.json', { body: Buffer.from(JSON.stringify(inputs, null, 2)), contentType: 'application/json' });
    expect(Array.isArray(inputs)).toBe(true);
    // Inventory is not equivalent to functional amount validation.
  } finally { await d.attach(page, info); }
});
