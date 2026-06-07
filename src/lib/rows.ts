import type { Item } from "@/lib/decompose"

export type Row = { name: string; qty: number; price: number; total: number }

export function toRows(item: Item): Row[] {
  const rows: Row[] = []
  for (const line of item.lines) {
    if (line.qty > 0)
      rows.push({
        name: line.name,
        qty: line.qty,
        price: line.price,
        total: line.price * line.qty,
      })
  }
  if (item.bags > 0)
    rows.push({ name: "塑膠袋", qty: item.bags, price: 1, total: item.bags })
  return rows
}

export const fmt = (n: number) => n.toLocaleString("en-US")
