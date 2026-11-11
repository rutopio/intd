import { DEFAULT_BAG_NAME, DEFAULT_ITEMS } from "@/lib/constants";
import type { DecompositionItemConfig } from "@/lib/decomposition";
import { useLocalStorage } from "./use-local-storage";

export function useSettings() {
  const [items, setItems] = useLocalStorage<DecompositionItemConfig[]>(
    "idc:settings",
    DEFAULT_ITEMS
  );
  const [bagName, setBagName] = useLocalStorage<string>(
    "idc:bagName",
    DEFAULT_BAG_NAME
  );
  return { items, setItems, bagName, setBagName };
}
