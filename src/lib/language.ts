export type Lang = "en" | "zh"

export function getLangFromPath(pathname: string): Lang {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "zh"
}
