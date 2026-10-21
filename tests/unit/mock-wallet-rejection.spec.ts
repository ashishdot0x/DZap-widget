import { test, expect } from '@playwright/test';
import { ReadOnlyMockWallet } from '../../helpers/mockWallet';

test('chain switch rejection uses EIP-1193 user rejection code', async ({ page }) => {
  const wallet = await ReadOnlyMockWallet.install(page, { rejectChainSwitch: true });
  await expect(wallet.handle('wallet_switchEthereumChain', [{ chainId: '0x1' }])).rejects.toMatchObject({ code: 4001 });
  expect(wallet.actions.at(-1)?.errorCode).toBe(4001);
});

test('transaction broadcast remains blocked even with connected mock wallet', async ({ page }) => {
  const wallet = await ReadOnlyMockWallet.install(page);
  await wallet.handle('eth_requestAccounts');
  await expect(wallet.handle('eth_sendRawTransaction', ['0x00'])).rejects.toMatchObject({ code: 4001 });
  expect(wallet.actions.at(-1)?.errorCode).toBe(4001);
});
