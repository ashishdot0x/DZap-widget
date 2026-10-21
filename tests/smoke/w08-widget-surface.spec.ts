import { test, expect } from '@playwright/test';
import { ReadOnlyMockWallet } from '../../helpers/mockWallet';
import { classifyLabels, discoverControls } from '../../helpers/widgetDiscovery';
import { monitor } from '../../helpers/diagnostics';

test('W08: inventory chain, token, pool, wallet and review surfaces with a non-spending wallet', async ({ page }, info) => {
  const diagnostics = monitor(page);
  const wallet = await ReadOnlyMockWallet.install(page);
  try {
    const response = await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('body')).toBeVisible();
    const controls = await discoverControls(page);
    const categories = classifyLabels(controls);
    await info.attach('widget-surface.json', {
      body: Buffer.from(JSON.stringify({ controls, categories, walletRpc: wallet.actions.map(a => a.method) }, null, 2)),
      contentType: 'application/json',
    });
    expect(controls.length, 'Widget must expose at least one visible control').toBeGreaterThan(0);
    // Discovery is not a functional PASS for any of the categorized actions.
    expect(wallet.actions.some(a => /eth_sendTransaction|eth_sendRawTransaction|personal_sign|eth_signTypedData_v4/.test(a.method))).toBe(false);
  } finally {
    await diagnostics.attach(page, info);
  }
});
