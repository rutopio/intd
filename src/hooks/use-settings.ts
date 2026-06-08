import type { ItemConfig } from "@/lib/decompose"
import { useLocalStorage } from "./use-local-storage"

// Upper bound on user-configurable item types. The built-in plastic bag counts
// toward a total cap of 7, so custom items max out at 6 (6 + bag = 7).
export const MAX_ITEMS = 6

export const DEFAULT_ITEMS: ItemConfig[] = [
  { name: "便當", min: 90, max: 150, digits: [0, 5, 9] },
  { name: "飲料", min: 40, max: 90, digits: [0, 5] },
]

// Built-in $1 filler item; only its display name is user-configurable.
export const DEFAULT_BAG_NAME = "塑膠袋"

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
