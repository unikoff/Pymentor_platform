import { createContext, useCallback, useContext, useState, useSyncExternalStore, type Dispatch, type ReactNode, type SetStateAction } from "react";

class PracticeSession {
  private values = new Map<string, unknown>();
  private listeners = new Map<string, Set<() => void>>();

  read<T>(key: string, initial: () => T): T {
    if (!this.values.has(key)) this.values.set(key, initial());
    return this.values.get(key) as T;
  }

  write<T>(key: string, action: SetStateAction<T>) {
    const previous = this.values.get(key) as T;
    const next = typeof action === "function" ? (action as (value: T) => T)(previous) : action;
    if (Object.is(previous, next)) return;
    this.values.set(key, next);
    this.listeners.get(key)?.forEach((listener) => listener());
  }

  subscribe(key: string, listener: () => void) {
    const listeners = this.listeners.get(key) ?? new Set();
    listeners.add(listener);
    this.listeners.set(key, listeners);
    return () => { listeners.delete(listener); };
  }
}

const SessionContext = createContext<PracticeSession | null>(null);

export function PracticeSessionProvider({ children }: { children: ReactNode }) {
  const [session] = useState(() => new PracticeSession());
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}

export function usePracticeState<T>(key: string, initial: () => T): [T, Dispatch<SetStateAction<T>>] {
  const session = useContext(SessionContext);
  if (!session) throw new Error("PracticeSessionProvider is missing");
  const subscribe = useCallback((listener: () => void) => session.subscribe(key, listener), [session, key]);
  const snapshot = useCallback(() => session.read(key, initial), [session, key, initial]);
  const value = useSyncExternalStore(subscribe, snapshot);
  const setValue = useCallback((action: SetStateAction<T>) => session.write(key, action), [session, key]);
  return [value, setValue];
}
