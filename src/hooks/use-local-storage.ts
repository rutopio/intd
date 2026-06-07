import * as React from "react"

// useState-shaped hook that persists to localStorage. Instances on the same
// page sharing a key stay in sync via a custom event, so one writer's update is
// seen by the others immediately.
export function useLocalStorage<T>(key: string, initial: T) {
  const event = `local-storage:${key}`

  const read = React.useCallback((): T => {
    if (typeof window === "undefined") return initial
    try {
      const raw = window.localStorage.getItem(key)
      return raw === null ? initial : (JSON.parse(raw) as T)
    } catch {
      return initial
    }
  }, [key, initial])

  const [value, setValue] = React.useState<T>(read)

  const set = React.useCallback<React.Dispatch<React.SetStateAction<T>>>(
    (action) => {
      setValue((prev) => {
        const next =
          typeof action === "function" ? (action as (p: T) => T)(prev) : action
        try {
          window.localStorage.setItem(key, JSON.stringify(next))
          window.dispatchEvent(new CustomEvent(event))
        } catch {
          // Quota exceeded or private mode; ignore, it does not affect the UI.
        }
        return next
      })
    },
    [key, event],
  )

  React.useEffect(() => {
    const sync = () => setValue(read())
    window.addEventListener(event, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(event, sync)
      window.removeEventListener("storage", sync)
    }
  }, [event, read])

  return [value, set] as const
}
