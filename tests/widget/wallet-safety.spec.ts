import { test, expect } from '@playwright/test';
import { ReadOnlyMockWallet } from '../../helpers/mockWallet';
import { selectWidgetMode } from '../../helpers/embeddedWidget';

test('E02: switching Swap to Zap never triggers a transaction', async ({ page }, info) => {
  const wallet = await ReadOnlyMockWallet.install(page);
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await selectWidgetMode(page, 'Swap');
  await selectWidgetMode(page, 'Zap');
  const methods = wallet.actions.map(action => action.method);
  await info.attach('wallet-methods.json', {
    body: Buffer.from(JSON.stringify(methods, null, 2)), contentType: 'application/json',
  });
  expect(methods.filter(method => /eth_sendTransaction|eth_sendRawTransaction|personal_sign|eth_signTypedData/i.test(method))).toEqual([]);
});
