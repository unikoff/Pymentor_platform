import { lazy, type ComponentType } from "react";

// Keep lazy components at module scope, with their original prop types.
export function lazyNamed<Module, Key extends keyof Module>(load: () => Promise<Module>, name: Key) {
  return lazy(async () => ({ default: (await load())[name] as Extract<Module[Key], ComponentType<any>> }));
}
