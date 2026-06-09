import { DEFAULT_BAG_NAME, DEFAULT_ITEMS } from "@/lib/constants"
import type { ItemConfig } from "@/lib/decompose"
import { useLocalStorage } from "./use-local-storage"

export function useSettings() {
  const [items, setItems] = useLocalStorage<ItemConfig[]>(
    "idc:settings",
    DEFAULT_ITEMS,
  )
  const [bagName, setBagName] = useLocalStorage<string>(
    "idc:bagName",
    DEFAULT_BAG_NAME,
  )
  return { items, setItems, bagName, setBagName }
}
