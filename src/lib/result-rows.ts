import type { DecompositionResult } from "@/lib/decomposition";

export type ResultRow = {
  name: string;
  qty: number;
  price: number;
  total: number;
};

export function getResultRows(
  result: DecompositionResult,
  bagName = "塑膠袋"
): ResultRow[] {
  const rows: ResultRow[] = [];
  for (const line of result.lines) {
    if (line.qty > 0)
      rows.push({
        name: line.name,
        qty: line.qty,
        price: line.price,
        total: line.price * line.qty,
      });
  }
  if (result.bags > 0)
    rows.push({
      name: bagName,
      qty: result.bags,
      price: 1,
      total: result.bags,
    });
  return rows;
}

export const formatNumber = (value: number) => value.toLocaleString("en-US");
