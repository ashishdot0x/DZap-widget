import { test, expect } from '@playwright/test';
import { auditNetwork } from '../../helpers/networkAudit';

test('W06: capture quote, pool and balance endpoint status without changing funds', async ({ page }, info) => {
  const audit = auditNetwork(page);
  try {
    const response = await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    expect(response?.status(), 'Top-level page status').toBeLessThan(400);
    await expect(page.locator('body')).toBeVisible();
    // Never assume a quote endpoint is called before a token/amount is selected.
    await page.waitForTimeout(2000);
    const failures = audit.requests.filter(r => r.status !== undefined && r.status >= 500);
    await info.attach('server-error-count.json', {
      body: Buffer.from(JSON.stringify({ count: failures.length, endpoints: failures }, null, 2)),
      contentType: 'application/json',
    });
    // Discovery mode; failures require triage before being classified as product bugs.
  } finally {
    await audit.attach(info);
  }
});
