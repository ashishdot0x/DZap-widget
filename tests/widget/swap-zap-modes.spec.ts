import { test, expect } from '@playwright/test';
import { ReadOnlyMockWallet } from '../../helpers/mockWallet';
import { captureWidgetState, captureModeCandidates, selectWidgetMode, type Mode } from '../../helpers/embeddedWidget';
import { auditNetwork } from '../../helpers/networkAudit';

for (const mode of ['Swap', 'Zap'] as Mode[]) {
  test('E01 ' + mode + ': mode selection and rendered widget evidence', async ({ page }, info) => {
    const audit = auditNetwork(page);
    const wallet = await ReadOnlyMockWallet.install(page);
    try {
      const response = await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
      expect(response?.status()).toBeLessThan(400);
      await selectWidgetMode(page, mode);
      const state = await captureWidgetState(page, mode);
      await info.attach(mode.toLowerCase() + '-widget-state.json', {
        body: Buffer.from(JSON.stringify(state, null, 2)), contentType: 'application/json',
      });
      const combined = state.frames.flatMap(frame => frame.controls);
      expect(combined.length, mode + ' widget must expose controls').toBeGreaterThan(0);
      expect(wallet.actions.some(action => /eth_sendTransaction|eth_sendRawTransaction/.test(action.method)))
        .toBe(false);
    } finally {
      await info.attach('widget-mode-candidates.json', { body: Buffer.from(JSON.stringify(await captureModeCandidates(page), null, 2)), contentType: 'application/json' });
      await audit.attach(info);
      await page.screenshot({ path: info.outputPath(mode.toLowerCase() + '-widget.png'), fullPage: true }).catch(() => undefined);
    }
  });
}
