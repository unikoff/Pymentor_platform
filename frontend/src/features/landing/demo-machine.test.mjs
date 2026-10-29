import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialDemoState, demoReducer } from './demo-machine.mjs';

test('the Python example advances deterministically from code to output', () => {
  let state = createInitialDemoState();

  state = demoReducer(state, { type: 'run' });
  assert.deepEqual(state, { status: 'running', step: 1, output: '' });

  state = demoReducer(state, { type: 'advance' });
  assert.deepEqual(state, { status: 'running', step: 2, output: '' });

  state = demoReducer(state, { type: 'advance' });
  assert.deepEqual(state, { status: 'complete', step: 2, output: 'Привет, Мира!' });
});

test('reset returns every part of the demo to its initial state', () => {
  const completed = { status: 'complete', step: 2, output: 'Привет, Мира!' };

  assert.deepEqual(demoReducer(completed, { type: 'reset' }), createInitialDemoState());
});

test('reduced motion skips timed steps and shows the deterministic result', () => {
  const state = demoReducer(createInitialDemoState(), { type: 'run', reducedMotion: true });

  assert.deepEqual(state, { status: 'complete', step: 2, output: 'Привет, Мира!' });
});

test('invalid transitions do not change state', () => {
  const initial = createInitialDemoState();
  const running = demoReducer(initial, { type: 'run' });

  assert.equal(demoReducer(initial, { type: 'advance' }), initial);
  assert.equal(demoReducer(running, { type: 'run' }), running);
});
