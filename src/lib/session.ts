import { removeLocalStorageKey } from "@/hooks/use-local-storage";

// Per-session calculation state persisted in localStorage. User preferences
// (sortMode) and settings (items, bagName) are intentionally excluded so that
// clearing a session keeps the user's configuration.
const SESSION_KEYS = ["idc:amount", "idc:target", "idc:byMode"] as const;

// Clear the current calculation back to its initial state. Removing each key and
// notifying subscribers makes every mounted useLocalStorage instance re-read.
export function clearSession() {
  if (typeof window === "undefined") return;
  for (const key of SESSION_KEYS) removeLocalStorageKey(key);
}
