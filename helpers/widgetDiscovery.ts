import type { Locator, Page } from '@playwright/test';

export type WidgetCandidate = {
  text: string;
  ariaLabel: string | null;
  role: string | null;
  testId: string | null;
  tag: string;
  disabled: boolean;
};

export async function discoverControls(page: Page): Promise<WidgetCandidate[]> {
  return page.locator('button:visible,[role="button"]:visible,[role="tab"]:visible,input:visible').evaluateAll(els =>
    els.map(el => ({
      text: (el.textContent ?? '').trim().slice(0, 160),
      ariaLabel: el.getAttribute('aria-label'),
      role: el.getAttribute('role'),
      testId: el.getAttribute('data-testid'),
      tag: el.tagName.toLowerCase(),
      disabled: el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true',
    }))
  );
}

export function connectCandidate(page: Page): Locator {
  return page.getByRole('button', { name: /connect\s*(wallet)?|wallet\s*connect/i }).first();
}

export function amountCandidates(page: Page): Locator {
  return page.locator('input:visible').filter({ visible: true });
}

/** Categorizes observed text only: not evidence that a clickable selector exists. */
export function classifyLabels(items: WidgetCandidate[]) {
  const combined = items.map(item => [item.text, item.ariaLabel ?? ''].join(' '));
  return {
    chain: combined.filter(s => /chain|network/i.test(s)),
    token: combined.filter(s => /token|asset/i.test(s)),
    pool: combined.filter(s => /pool|position|protocol/i.test(s)),
    review: combined.filter(s => /review|confirm|swap|bridge|zap/i.test(s)),
    wallet: combined.filter(s => /connect|wallet/i.test(s)),
  };
}
