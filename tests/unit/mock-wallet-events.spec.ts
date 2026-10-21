import { test, expect } from '@playwright/test';
import { ReadOnlyMockWallet, QA_WALLET_ADDRESS } from '../../helpers/mockWallet';

test('connected and disconnected wallet emits EIP-1193 accountsChanged', async ({ page }) => {
  const wallet = await ReadOnlyMockWallet.install(page);
  await page.goto('about:blank');
  const ready = await page.evaluate(() => Boolean((window as any).__dzapQaProvider));
  expect(ready).toBe(true);
  await page.evaluate(() => {
    (window as any).__qaEvents = [];
    (window as any).__dzapQaProvider.on('accountsChanged', (accounts: string[]) =>
      (window as any).__qaEvents.push(accounts));
  });
  await wallet.handle('eth_requestAccounts');
  await wallet.disconnect();
  const events = await page.evaluate(() => (window as any).__qaEvents);
  expect(events).toEqual([[QA_WALLET_ADDRESS], []]);
});

test('switch chain emits chainChanged with hexadecimal chain ID', async ({ page }) => {
  const wallet = await ReadOnlyMockWallet.install(page);
  await page.goto('about:blank');
  await page.evaluate(() => {
    (window as any).__qaEvents = [];
    (window as any).__dzapQaProvider.on('chainChanged', (value: string) =>
      (window as any).__qaEvents.push(value));
  });
  await wallet.handle('wallet_switchEthereumChain', [{ chainId: '0x1' }]);
  expect(await wallet.handle('eth_chainId')).toBe('0x1');
  expect(await page.evaluate(() => (window as any).__qaEvents)).toEqual(['0x1']);
  await expect(wallet.handle('wallet_switchEthereumChain', [{ chainId: 'bad' }]))
    .rejects.toMatchObject({ code: -32602 });
});
