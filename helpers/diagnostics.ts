import type { Page, TestInfo } from '@playwright/test';
export function monitor(page: Page) {
  const errors: string[] = [];
  const failedRequests: string[] = [];
  const apiResponses: { url: string; status: number }[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('requestfailed', request => failedRequests.push(request.method() + ' ' + request.url() + ': ' + (request.failure()?.errorText ?? 'unknown')));
  page.on('response', response => {
    if (/\/api\/|\/v1\/|graphql|quote|buildTx|position|pool/i.test(response.url())) {
      apiResponses.push({ url: response.url(), status: response.status() });
    }
  });
  return {
    errors,
    async attach(page: Page, info: TestInfo) {
      const controls = await page.locator('button,input,[role="button"],[role="tab"]').evaluateAll(nodes => nodes.slice(0, 200).map(el => ({
        tag: el.tagName, text: (el.textContent ?? '').trim().slice(0, 90),
        testid: el.getAttribute('data-testid'), label: el.getAttribute('aria-label'),
        placeholder: el.getAttribute('placeholder'),
      }))).catch(() => []);
      await info.attach('diagnostics.json', { body: Buffer.from(JSON.stringify({ errors, failedRequests, apiResponses, controls }, null, 2)), contentType: 'application/json' });
      await page.screenshot({ path: info.outputPath('widget-state.png'), fullPage: true }).catch(() => undefined);
    }
  };
}
