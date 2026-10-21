import { expect, type Frame, type Page, type Locator } from '@playwright/test';

export type WidgetSurface = Page | Frame;
export type Mode = 'Swap' | 'Zap';

export async function locateWidget(page: Page): Promise<WidgetSurface> {
  for (const frame of page.frames()) {
    if (frame === page.mainFrame()) continue;
    const controls = await frame.locator('input,button,[role="button"]').count().catch(() => 0);
    if (controls > 2) return frame;
  }
  return page;
}

/**
 * Prefer accessible mode controls. Some responsive versions hide the word Swap/Zap
 * inside a visible icon button. In that case click the visible ancestor button,
 * not the hidden span. Never force-click a hidden element.
 */
export async function selectWidgetMode(page: Page, mode: Mode): Promise<WidgetSurface> {
  const exact = new RegExp('^' + mode + '$', 'i');
  const candidates: Locator[] = [
    page.getByRole('tab', { name: exact }),
    page.getByRole('button', { name: exact }),
    page.locator('button').filter({ hasText: exact }),
    page.getByText(exact).locator('xpath=ancestor::button[1]'),
    page.getByText(exact).locator('xpath=ancestor::*[@role="tab"][1]'),
  ];
  for (const candidate of candidates) {
    const count = await candidate.count();
    for (let i = 0; i < Math.min(count, 12); i++) {
      const entry = candidate.nth(i);
      if (!await entry.isVisible().catch(() => false)) continue;
      if (!await entry.isEnabled().catch(() => false)) continue;
      await entry.click();
      return locateWidget(page);
    }
  }
  const candidatesDump = (await captureModeCandidates(page)).filter(item => /swap|zap|trade|widget|mode/i.test(item.text + ' ' + (item.ariaLabel ?? '') + ' ' + item.html)).slice(0, 18);
  throw new Error('No clickable ' + mode + ' mode control found. DOM candidates: ' + JSON.stringify(candidatesDump).slice(0, 4500));
}

export async function captureModeCandidates(page: Page) {
  return page.locator('button,[role="tab"],[role="button"]').evaluateAll(elements =>
    elements.slice(0, 200).map(el => {
      const rect = el.getBoundingClientRect();
      return {
        tag: el.tagName.toLowerCase(),
        text: (el.textContent ?? '').trim().slice(0, 120),
        ariaLabel: el.getAttribute('aria-label'),
        role: el.getAttribute('role'),
        visible: !!(rect.width && rect.height),
        html: el.outerHTML.slice(0, 550),
      };
    })
  );
}

export async function captureWidgetState(page: Page, mode: Mode) {
  return {
    mode,
    frames: await Promise.all(page.frames().map(async frame => ({
      url: frame.url().split('?')[0],
      controls: await frame.locator('button:visible,input:visible,[role="button"]:visible,[role="tab"]:visible')
        .evaluateAll(elements => elements.slice(0, 120).map(el => ({
          tag: el.tagName.toLowerCase(),
          name: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 100),
          placeholder: el.getAttribute('placeholder'),
          testid: el.getAttribute('data-testid'),
        }))).catch(() => []),
      visibleText: (await frame.locator('body').innerText().catch(() => '')).slice(0, 1600),
    }))),
  };
}
