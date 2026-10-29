export const DEMO_OUTPUT = 'Привет, Мира!';

export function createInitialDemoState() {
  return { status: 'idle', step: 0, output: '' };
}

export function demoReducer(state, action) {
  if (action.type === 'reset') return createInitialDemoState();

  if (action.type === 'run') {
    if (state.status === 'running') return state;
    if (action.reducedMotion) {
      return { status: 'complete', step: 2, output: DEMO_OUTPUT };
    }
    return { status: 'running', step: 1, output: '' };
  }

  if (action.type === 'advance' && state.status === 'running') {
    if (state.step === 1) return { ...state, step: 2 };
    return { status: 'complete', step: 2, output: DEMO_OUTPUT };
  }

  return state;
}
