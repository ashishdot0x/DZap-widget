import { test, expect } from '@playwright/test';
import { monitor } from '../../helpers/diagnostics';
for (const width of [320, 375, 768, 1280]) {
  test('W04: no document-level horizontal overflow at ' + width + 'px', async ({ page }, info) => {
    const d = monitor(page);
    try {
      await page.setViewportSize({ width, height: 820 });
      const response = await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
      expect(response?.status()).toBeLessThan(400);
      await expect(page.locator('body')).toBeVisible();
      const result = await page.evaluate(() => ({
        actual: document.documentElement.scrollWidth,
        allowed: document.documentElement.clientWidth + 2
      }));
      expect(result.actual, 'Document exceeds viewport width').toBeLessThanOrEqual(result.allowed);
    } finally { await d.attach(page, info); }
  });
}
