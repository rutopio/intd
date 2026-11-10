import { useLocation } from "@tanstack/react-router"
import { getLangFromPath } from "@/lib/language"

// Language is derived from the path: /en or /en/* is English, everything else is
// Chinese (the bare-path default). The single source of truth for the active
// locale across the app.
export function useLang() {
  const pathname = useLocation({ select: (l) => l.pathname })
  return getLangFromPath(pathname)
}
