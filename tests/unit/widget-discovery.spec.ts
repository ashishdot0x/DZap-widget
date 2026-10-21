import { test, expect } from '@playwright/test';
import { classifyLabels } from '../../helpers/widgetDiscovery';

test('UI text classification does not invent functionality', () => {
  const labels = classifyLabels([
    { text: 'Select Token', ariaLabel: null, role: 'button', testId: null, tag: 'button', disabled: false },
    { text: 'Choose Chain', ariaLabel: null, role: 'button', testId: null, tag: 'button', disabled: false },
    { text: 'Review Swap', ariaLabel: null, role: 'button', testId: null, tag: 'button', disabled: true },
  ]);
  expect(labels.token).toHaveLength(1);
  expect(labels.chain).toHaveLength(1);
  expect(labels.review).toHaveLength(1);
  expect(labels.wallet).toHaveLength(0);
});
