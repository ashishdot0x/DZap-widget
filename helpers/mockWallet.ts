import type { Page } from '@playwright/test';

export type WalletAction = {
  method: string; params: unknown[]; result?: unknown; errorCode?: number;
};
export type WalletBehavior = {
  rejectConnect?: boolean; rejectSigning?: boolean; rejectTransaction?: boolean; rejectChainSwitch?: boolean;
};
export const QA_WALLET_ADDRESS = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
export const QA_WALLET_NAME = 'DZap Widget QA Wallet';

/**
 * EIP-1193 read-only mock. Never broadcasts real transactions or returns forged tx receipts.
 * Calls that would spend money explicitly reject. Integrate the reference suite's fork
 * signer only after the Widget wallet-connection DOM and backend have been verified.
 */
export class ReadOnlyMockWallet {
  readonly actions: WalletAction[] = [];
  private connected = false;
  private chainId = 8453;
  constructor(private readonly page: Page, readonly behavior: WalletBehavior = {}) {}

  static async install(page: Page, behavior: WalletBehavior = {}): Promise<ReadOnlyMockWallet> {
    const wallet = new ReadOnlyMockWallet(page, behavior);
    await page.exposeFunction('__dzapQaRpc', (method: string, params: unknown[]) => wallet.handle(method, params));
    await page.addInitScript(({ address, walletName }) => {
      const listeners = new Map<string, Set<(value: unknown) => void>>();
      const provider = {
        isDZapQaWallet: true,
        request: ({ method, params = [] }: { method: string; params?: unknown[] }) =>
          (window as any).__dzapQaRpc(method, params),
        on: (name: string, cb: (value: unknown) => void) => {
          if (!listeners.has(name)) listeners.set(name, new Set());
          listeners.get(name)!.add(cb);
          return provider;
        },
        removeListener: (name: string, cb: (value: unknown) => void) => {
          listeners.get(name)?.delete(cb);
          return provider;
        },
      };
      (window as any).__dzapQaProvider = provider;
      (window as any).__dzapQaEmit = (name: string, value: unknown) => listeners.get(name)?.forEach(callback => callback(value));
      Object.defineProperty(window, 'ethereum', { value: provider, configurable: true });
      const announce = () => window.dispatchEvent(new CustomEvent('eip6963:announceProvider', {
        detail: Object.freeze({
          info: { uuid: '88c8b02f-0d0a-4f4c-87fb-eaa7129d4acd', name: walletName, rdns: 'io.dzap.widget.qa',
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>' },
          provider,
        }),
      }));
      window.addEventListener('eip6963:requestProvider', announce);
      announce();
      void address;
    }, { address: QA_WALLET_ADDRESS, walletName: QA_WALLET_NAME });
    return wallet;
  }

  private async emit(name: string, value: unknown): Promise<void> {
    await this.page.evaluate(([eventName, payload]) => {
      (window as any).__dzapQaEmit?.(eventName, payload);
    }, [name, value] as const).catch(() => undefined);
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    await this.emit('accountsChanged', []);
  }

  async handle(method: string, params: unknown[] = []): Promise<unknown> {
    const entry: WalletAction = { method, params };
    this.actions.push(entry);
    const reject = (code: number, message: string): never => {
      entry.errorCode = code;
      throw Object.assign(new Error(message), { code });
    };
    switch (method) {
      case 'eth_chainId': return (entry.result = '0x' + this.chainId.toString(16));
      case 'net_version': return (entry.result = String(this.chainId));
      case 'eth_accounts': return (entry.result = this.connected ? [QA_WALLET_ADDRESS] : []);
      case 'eth_requestAccounts':
        if (this.behavior.rejectConnect) return reject(4001, 'User rejected account connection');
        this.connected = true;
        await this.emit('accountsChanged', [QA_WALLET_ADDRESS]);
        return (entry.result = [QA_WALLET_ADDRESS]);
      case 'wallet_switchEthereumChain':
        if (this.behavior.rejectChainSwitch) return reject(4001, 'User rejected chain switch');
        const value = (params[0] as { chainId: string } | undefined)?.chainId;
        if (!value || !/^0x[0-9a-f]+$/i.test(value)) return reject(-32602, 'Invalid chainId');
        this.chainId = Number.parseInt(value, 16);
        await this.emit('chainChanged', '0x' + this.chainId.toString(16));
        return (entry.result = null);
      case 'personal_sign':
      case 'eth_signTypedData_v4':
        return reject(4001, 'Read-only QA wallet: signing intentionally disabled');
      case 'eth_sendTransaction':
      case 'eth_sendRawTransaction':
        return reject(4001, 'Read-only QA wallet: transaction broadcasting disabled');
      default:
        return reject(4200, 'Read-only QA wallet: unsupported method ' + method);
    }
  }
}
