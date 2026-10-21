import { test, expect } from '@playwright/test';
import { monitor } from '../../helpers/diagnostics';

/**
 * Evidence-led checks for the DZap Widget Studio.
 * Screenshots from 2026-10-21 show Studio controls with a loading/skeleton widget.
 * A green shell test must not be interpreted as a functional widget PASS.
 */
test('W09: Studio renders its swap/zap workspace', async ({ page }, info) => {
  const d = monitor(page);
  try {
    const response = await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    expect(response?.status()).toBeLessThan(400);
    await expect(page.getByText(/widget st/i).filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText(/^swap$/i).filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText(/^zap$/i).filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText(/connect wallet/i).filter({ visible: true }).first()).toBeVisible();
  } finally {
    await d.attach(page, info);
  }
});

test('W10: embedded widget becomes interactive rather than remaining a loading skeleton', async ({ page }, info) => {
  const d = monitor(page);
  try {
    const response = await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    expect(response?.status()).toBeLessThan(400);
    await expect(page.getByText(/connect wallet/i).filter({ visible: true }).first()).toBeVisible();

    // Require an actual token/amount input or an accessible asset-selection control
    // inside the loaded app. Studio theme controls alone do not satisfy this condition.
    const interactive = page.locator([
      'input[inputmode="decimal"]:visible',
      'input[inputmode="numeric"]:visible',
      'input[type="number"]:visible',
      'input[placeholder="0.0"]:visible',
      'button:visible[aria-label*="token" i]',
      'button:visible[aria-label*="asset" i]',
      '[role="button"]:visible[aria-label*="token" i]',
    ].join(','));
    await expect.poll(() => interactive.count(), {
      timeout: 20000,
      message: 'Studio loaded, but no embedded amount input or asset-selector appeared; inspect screenshot for persistent skeleton',
    }).toBeGreaterThan(0);
  } finally {
    await d.attach(page, info);
  }
});
