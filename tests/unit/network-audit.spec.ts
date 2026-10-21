import { test, expect } from '@playwright/test';
import { redact } from '../../helpers/networkAudit';

test('sensitive query strings are removed from captured endpoint URLs', () => {
  expect(redact('https://example.com/v1/quote?apiKey=secret&address=0xabc')).toBe('https://example.com/v1/quote');
  expect(redact('invalid')).toBe('[invalid-url]');
});
