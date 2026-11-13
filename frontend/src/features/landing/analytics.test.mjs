import assert from 'node:assert/strict';
import test from 'node:test';
import { initLandingAnalytics, trackConsultationAccepted } from './analytics.ts';

test('initializes the counter once and queues the accepted application goal without personal data', () => {
  const scripts = [];
  globalThis.window = {};
  globalThis.document = {
    referrer: 'https://example.org/',
    scripts,
    createElement: () => ({}),
    head: { appendChild: (script) => scripts.push(script) },
  };
  globalThis.location = { href: 'https://knowi.ru/backend/landing?utm_source=test' };
  globalThis.window.location = { ...globalThis.location, hostname: 'knowi.ru' };

  initLandingAnalytics();
  initLandingAnalytics();
  trackConsultationAccepted();

  assert.equal(scripts.length, 1);
  assert.equal(scripts[0].src, 'https://mc.yandex.ru/metrika/tag.js?id=114225370');
  const calls = globalThis.window.ym.a.map((args) => Array.from(args));
  assert.equal(calls.filter((call) => call[1] === 'init').length, 1);
  assert.deepEqual(calls.at(-1), [114225370, 'reachGoal', 'consultation_request_accepted']);
});

test('analytics failures do not escape into the application form', () => {
  globalThis.window.ym = () => { throw new Error('blocked'); };
  assert.doesNotThrow(() => trackConsultationAccepted());
});
