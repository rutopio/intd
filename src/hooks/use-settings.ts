import { useCallback } from "react";
import { DEFAULT_BAG_NAME, DEFAULT_ITEMS } from "@/lib/constants";
import type { DecompositionItemConfig } from "@/lib/decomposition";
import { storedSettings } from "@/lib/stored-state";
import { removeLocalStorageKey, useLocalStorage } from "./use-local-storage";

export function useSettings() {
  const [items, storeItems] = useLocalStorage<DecompositionItemConfig[]>(
    "idc:settings",
    DEFAULT_ITEMS,
    storedSettings.shape.items
  );
  const [bagName, setBagName] = useLocalStorage<string>(
    "idc:bagName",
    DEFAULT_BAG_NAME,
    storedSettings.shape.bagName
  );
  const setItems = useCallback<typeof storeItems>(
    (value) => {
      storeItems(value);
      removeLocalStorageKey("idc:byMode");
    },
    [storeItems]
  );
  return { items, setItems, bagName, setBagName };
}
