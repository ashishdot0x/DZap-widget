import { test as base, expect } from '@playwright/test';

export type CheckCategory = 'ui' | 'request' | 'wallet' | 'chain' | 'financial';
export type FailureClass = 'product' | 'provider' | 'infrastructure' | 'test-automation';
export type QaCheck = {
  name: string; category: CheckCategory; expected: unknown; actual: unknown;
  pass: boolean; note?: string; at: string;
};
export type QaEvent = { name: string; data: unknown; at: string };

export class QaLogger {
  readonly checks: QaCheck[] = [];
  readonly events: QaEvent[] = [];
  failure?: { classification: FailureClass; reason: string };

  check(name: string, category: CheckCategory, expected: unknown, actual: unknown, pass: boolean, note?: string): void {
    this.checks.push({ name, category, expected, actual, pass, note, at: new Date().toISOString() });
  }
  assertEqual(name: string, category: CheckCategory, actual: unknown, expected: unknown): void {
    const pass = JSON.stringify(actual) === JSON.stringify(expected);
    this.check(name, category, expected, actual, pass);
    expect(actual, name).toEqual(expected);
  }
  async record<T>(name: string, category: CheckCategory, expected: unknown, fn: () => Promise<T> | T): Promise<T> {
    try {
      const actual = await fn();
      this.check(name, category, expected, actual, true);
      return actual;
    } catch (error) {
      this.check(name, category, expected, null, false, String(error));
      throw error;
    }
  }
  event(name: string, data: unknown): void {
    this.events.push({ name, data, at: new Date().toISOString() });
  }
  classify(classification: FailureClass, reason: string): void {
    this.failure = { classification, reason };
  }
}

export const test = base.extend<{ qa: QaLogger }>({
  qa: async ({}, use, testInfo) => {
    const qa = new QaLogger();
    await use(qa);
    await testInfo.attach('qa-checks.json', {
      body: Buffer.from(JSON.stringify({ checks: qa.checks, events: qa.events, failure: qa.failure }, null, 2)),
      contentType: 'application/json',
    });
  }
});
export { expect };
