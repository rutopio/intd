import { useLocation } from "@tanstack/react-router"

export type Lang = "en" | "zh"

// Language is derived from the path: /en or /en/* is English, everything else is
// Chinese (the bare-path default). The single source of truth for the active
// locale across the app.
export function useLang(): Lang {
  const pathname = useLocation({ select: (l) => l.pathname })
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "zh"
}
