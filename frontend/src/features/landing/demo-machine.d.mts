export type DemoState = {
  status: 'idle' | 'running' | 'complete';
  step: 0 | 1 | 2;
  output: string;
};

export type DemoAction =
  | { type: 'run'; reducedMotion?: boolean }
  | { type: 'advance' }
  | { type: 'reset' };

export declare const DEMO_OUTPUT: string;
export declare function createInitialDemoState(): DemoState;
export declare function demoReducer(state: DemoState, action: DemoAction): DemoState;
