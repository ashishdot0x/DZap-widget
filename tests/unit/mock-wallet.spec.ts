import { test, expect } from '@playwright/test';
import { ReadOnlyMockWallet, QA_WALLET_ADDRESS } from '../../helpers/mockWallet';

test('mock wallet rejects spending and signing', async ({ page }) => {
  const wallet = await ReadOnlyMockWallet.install(page);
  await expect(wallet.handle('eth_sendTransaction')).rejects.toMatchObject({ code: 4001 });
  await expect(wallet.handle('personal_sign')).rejects.toMatchObject({ code: 4001 });
  expect(wallet.actions.map(item => item.method)).toEqual(['eth_sendTransaction', 'personal_sign']);
});

test('mock wallet implements chain and connection without funds', async ({ page }) => {
  const wallet = await ReadOnlyMockWallet.install(page);
  expect(await wallet.handle('eth_chainId')).toBe('0x2105');
  expect(await wallet.handle('eth_accounts')).toEqual([]);
  expect(await wallet.handle('eth_requestAccounts')).toEqual([QA_WALLET_ADDRESS]);
  expect(await wallet.handle('eth_accounts')).toEqual([QA_WALLET_ADDRESS]);
});

test('mock wallet supports simulated rejection', async ({ page }) => {
  const wallet = await ReadOnlyMockWallet.install(page, { rejectConnect: true });
  await expect(wallet.handle('eth_requestAccounts')).rejects.toMatchObject({ code: 4001 });
});
