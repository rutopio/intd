// Per-session calculation state persisted in localStorage. User preferences
// (sortMode) and settings (items, bagName) are intentionally excluded so that
// clearing a session keeps the user's configuration.
const SESSION_KEYS = [
  "idc:amount",
  "idc:results",
  "idc:target",
  "idc:seen",
  "idc:offset",
] as const

// Clear the current calculation back to its initial state. Removing each key and
// dispatching its custom event makes every mounted useLocalStorage instance
// re-read and fall back to its initial value, so the UI resets without a reload.
export function clearSession() {
  if (typeof window === "undefined") return
  for (const key of SESSION_KEYS) {
    window.localStorage.removeItem(key)
    window.dispatchEvent(new CustomEvent(`local-storage:${key}`))
  }
}
