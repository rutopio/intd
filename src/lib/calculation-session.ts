import { removeLocalStorageKey } from "@/hooks/use-local-storage";

// Keep user preferences when clearing calculation state.
const CALCULATION_STORAGE_KEYS = [
  "idc:amount",
  "idc:target",
  "idc:byMode",
] as const;

export function clearCalculationSession() {
  if (typeof window === "undefined") return;
  for (const key of CALCULATION_STORAGE_KEYS) removeLocalStorageKey(key);
}
