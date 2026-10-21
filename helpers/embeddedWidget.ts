import { expect, type Frame, type Locator, type Page } from '@playwright/test';

export type WidgetSurface = Page | Frame;
export type Mode = 'Swap' | 'Zap';

const modeNames = /^(swap|zap)$/i;

/** Find the widget inside a frame if present, otherwise use the main document. */
export async function locateWidget(page: Page): Promise<WidgetSurface> {
  const frames = page.frames().filter(f => f !== page.mainFrame());
  for (const frame of frames) {
    if (await frame.locator('input[placeholder="0.0"],input[inputmode="decimal"],button').count().catch(() => 0) > 2) {
      return frame;
    }
  }
  return page;
}

export async function selectWidgetMode(page: Page, mode: Mode): Promise<WidgetSurface> {
  // The Studio's visible mode tabs are the entry into the embedded widget.
  const tab = page.getByRole('tab', { name: new RegExp('^' + mode + '$', 'i') });
  const button = page.getByRole('button', { name: new RegExp('^' + mode + '$', 'i') });
  const text = page.getByText(new RegExp('^' + mode + '$', 'i'));
  const entry = await tab.count() ? tab.first() : await button.count() ? button.first() : text.first();
  await expect(entry, mode + ' mode selector').toBeVisible();
  await entry.click();
  await expect(entry).toBeVisible();
  return locateWidget(page);
}

export async function captureWidgetState(page: Page, mode: Mode) {
  const surfaces = [page.mainFrame(), ...page.frames().filter(f => f !== page.mainFrame())];
  return {
    mode,
    frames: await Promise.all(surfaces.map(async frame => ({
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
