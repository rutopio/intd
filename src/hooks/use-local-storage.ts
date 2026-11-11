import { useCallback, useMemo, useSyncExternalStore } from "react";
import { parseStoredValue, type StoredValueSchema } from "@/lib/stored-state";

// A raw string is a stable snapshot for useSyncExternalStore. Parsed objects
// would be new on every read and trigger repeated renders.
const volatileValues = new Map<string, string | null>();

function readRaw(key: string): string | null {
  if (volatileValues.has(key)) return volatileValues.get(key) ?? null;
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
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
    volatileValues.set(key, null);
  }
  notify(key);
}

export function readLocalStorageValue<T>(
  key: string,
  initial: T,
  schema: StoredValueSchema<T>
): T {
  return parseStoredValue(readRaw(key), initial, schema);
}

export function writeLocalStorageValue<T>(key: string, value: T) {
  const serialized = JSON.stringify(value);
  try {
    window.localStorage.setItem(key, serialized);
    volatileValues.delete(key);
  } catch {
    volatileValues.set(key, serialized);
  }
  notify(key);
}

// Subscribe to changes from this tab and other tabs without mirroring storage
// into React state through an effect.
export function useLocalStorage<T>(
  key: string,
  initial: T,
  schema: StoredValueSchema<T>
) {
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
  const value = useMemo(
    () => parseStoredValue(raw, initial, schema),
    [raw, initial, schema]
  );

  const set = useCallback<React.Dispatch<React.SetStateAction<T>>>(
    (action) => {
      const previous = parseStoredValue(readRaw(key), initial, schema);
      const next =
        typeof action === "function"
          ? (action as (previous: T) => T)(previous)
          : action;
      writeLocalStorageValue(key, next);
    },
    [key, initial, schema]
  );

  return [value, set] as const;
}
