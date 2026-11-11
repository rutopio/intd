import { useCallback, useMemo, useSyncExternalStore } from "react";

// A raw string is a stable snapshot for useSyncExternalStore. Parsed objects
// would be new on every read and trigger repeated renders.
const volatileValues = new Map<string, string>();

function readRaw(key: string): string | null {
  if (volatileValues.has(key)) return volatileValues.get(key) ?? null;
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function parseValue<T>(raw: string | null, initial: T): T {
  if (raw === null) return initial;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return initial;
  }
}

function notify(key: string) {
  window.dispatchEvent(new CustomEvent(`local-storage:${key}`));
}

export function removeLocalStorageKey(key: string) {
  volatileValues.delete(key);
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Storage can be unavailable; the in-memory value is still cleared.
  }
  notify(key);
}

// Subscribe to changes from this tab and other tabs without mirroring storage
// into React state through an effect.
export function useLocalStorage<T>(key: string, initial: T) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const onStorage = (event: StorageEvent) => {
        if (event.key === key || event.key === null) onChange();
      };
      window.addEventListener(`local-storage:${key}`, onChange);
      window.addEventListener("storage", onStorage);
      return () => {
        window.removeEventListener(`local-storage:${key}`, onChange);
        window.removeEventListener("storage", onStorage);
      };
    },
    [key]
  );
  const getSnapshot = useCallback(() => readRaw(key), [key]);
  const raw = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const value = useMemo(() => parseValue(raw, initial), [raw, initial]);

  const set = useCallback<React.Dispatch<React.SetStateAction<T>>>(
    (action) => {
      const previous = parseValue(readRaw(key), initial);
      const next =
        typeof action === "function"
          ? (action as (previous: T) => T)(previous)
          : action;
      const serialized = JSON.stringify(next);
      try {
        window.localStorage.setItem(key, serialized);
        volatileValues.delete(key);
      } catch {
        volatileValues.set(key, serialized);
      }
      notify(key);
    },
    [key, initial]
  );

  return [value, set] as const;
}
