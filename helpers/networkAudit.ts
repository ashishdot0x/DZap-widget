import type { Page, TestInfo } from '@playwright/test';

export type RequestEvidence = {
  method: string;
  url: string;
  status?: number;
  durationMs?: number;
  failed?: string;
};

/** Captures request metadata only. Never records request headers, cookies, bodies, or wallet signatures. */
export function auditNetwork(page: Page) {
  const started = new WeakMap<object, number>();
  const requests: RequestEvidence[] = [];
  const shouldCapture = (url: string) => /\/api\/|\/v1\/|graphql|quote|buildTx|balance|positions|pools/i.test(url);
  page.on('request', request => {
    started.set(request, Date.now());
  });
  page.on('response', response => {
    const request = response.request();
    if (!shouldCapture(request.url())) return;
    const url = redact(request.url());
    requests.push({
      method: request.method(),
      url,
      status: response.status(),
      durationMs: Date.now() - (started.get(request) ?? Date.now()),
    });
  });
  page.on('requestfailed', request => {
    if (!shouldCapture(request.url())) return;
    requests.push({
      method: request.method(),
      url: redact(request.url()),
      failed: request.failure()?.errorText ?? 'unknown',
    });
  });
  return {
    requests,
    async attach(info: TestInfo) {
      await info.attach('api-network-audit.json', {
        body: Buffer.from(JSON.stringify(requests, null, 2)),
        contentType: 'application/json',
      });
    },
  };
}

export function redact(raw: string): string {
  try {
    const u = new URL(raw);
    // Only keep endpoint path and host; URL query may contain addresses or API keys.
    return u.origin + u.pathname;
  } catch {
    return '[invalid-url]';
  }
}
