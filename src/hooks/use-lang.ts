import { useLocation } from "@tanstack/react-router";
import { getLangFromPath } from "@/lib/language";

export function useLang() {
  const pathname = useLocation({ select: (l) => l.pathname });
  return getLangFromPath(pathname);
}
