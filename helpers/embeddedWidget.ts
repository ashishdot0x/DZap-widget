import { expect, type Frame, type Page } from '@playwright/test';

export type WidgetSurface = Page | Frame;
export type Mode = 'Swap' | 'Zap';

export async function locateWidget(page: Page): Promise<WidgetSurface> {
  for (const frame of page.frames()) {
    if (frame === page.mainFrame()) continue;
    const n = await frame.locator('input,button,[role="button"]').count().catch(() => 0);
    if (n > 2) return frame;
  }
  return page;
}

export async function selectWidgetMode(page: Page, mode: Mode): Promise<WidgetSurface> {
  const label = new RegExp('^' + mode + '$', 'i');
  const candidates = [
    page.getByRole('tab', { name: label }).filter({ visible: true }),
    page.getByRole('button', { name: label }).filter({ visible: true }),
    page.getByText(label).filter({ visible: true }),
  ];
  for (const candidate of candidates) {
    if (await candidate.count() > 0) {
      const element = candidate.first();
      await expect(element, mode + ' mode selector').toBeVisible();
      await element.click();
      return locateWidget(page);
    }
  }
  throw new Error('No visible ' + mode + ' mode selector found');
}

export async function captureWidgetState(page: Page, mode: Mode) {
  const frames = page.frames();
  return {
    mode,
    frames: await Promise.all(frames.map(async frame => ({
      url: frame.url().split('?')[0],
      controls: await frame.locator('button:visible,input:visible,[role="button"]:visible,[role="tab"]:visible')
        .evaluateAll(elements => elements.slice(0, 100).map(el => ({
          tag: el.tagName.toLowerCase(),
          name: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 100),
          placeholder: el.getAttribute('placeholder'),
          testid: el.getAttribute('data-testid'),
        }))).catch(() => []),
      visibleText: (await frame.locator('body').innerText().catch(() => '')).slice(0, 1200),
    }))),
  };
}
