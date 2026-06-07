import type { ItemConfig } from "@/lib/decompose"
import { useLocalStorage } from "./use-local-storage"

export const DEFAULT_ITEMS: ItemConfig[] = [
  { name: "便當", min: 90, max: 150, digits: [0, 5, 9] },
  { name: "飲料", min: 40, max: 90, digits: [0, 5] },
]

export function useSettings() {
  const [items, setItems] = useLocalStorage<ItemConfig[]>(
    "idc:settings",
    DEFAULT_ITEMS,
  )
  return { items, setItems }
}
