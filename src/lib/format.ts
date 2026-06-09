import type { TFunction } from "i18next"
import type { Item } from "@/lib/decompose"
import { toRows } from "@/lib/rows"

// Pure formatters that turn a decomposition result into copyable text. No React
// here; the localized column labels come in via the passed t function.

export function toMarkdown(
  item: Item,
  showTotal: boolean,
  showUnit: boolean,
  bagName: string,
  t: TFunction,
): string {
  const d = showUnit ? "$" : ""
  const rows = toRows(item, bagName)
  const header = `| ${t("copy.colName")} | ${t("copy.colQty")} | ${t("copy.colPrice")} | ${t("copy.colTotal")} |`
  const divider = "| --- | ---: | ---: | ---: |"
  const body = rows.map(
    (r) => `| ${r.name} | ${r.qty} | ${d}${r.price} | ${d}${r.total} |`,
  )
  const total = `| ${t("copy.total")} |  |  | ${d}${item.total} |`
  return [header, divider, ...body, ...(showTotal ? [total] : [])].join("\n")
}

// CJK and fullwidth characters take 2 columns, everything else 1.
function displayWidth(s: string): number {
  let w = 0
  for (const ch of s) {
    w += /[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹏＀-｠￠-￦]/.test(ch) ? 2 : 1
  }
  return w
}

function pad(s: string, width: number, align: "left" | "right"): string {
  const fill = " ".repeat(Math.max(0, width - displayWidth(s)))
  return align === "right" ? fill + s : s + fill
}

export function toBoxTable(
  item: Item,
  showTotal: boolean,
  showUnit: boolean,
  bagName: string,
  t: TFunction,
): string {
  const d = showUnit ? "$" : ""
  const headers = [
    t("copy.colName"),
    t("copy.colQty"),
    t("copy.colPrice"),
    t("copy.colTotal"),
  ]
  const aligns = ["left", "right", "right", "right"] as const
  const body = toRows(item, bagName).map((r) => [
    r.name,
    String(r.qty),
    `${d}${r.price}`,
    `${d}${r.total}`,
  ])
  const totalRow = [t("copy.total"), "", "", `${d}${item.total}`]
  const all = [headers, ...body, ...(showTotal ? [totalRow] : [])]
  const widths = headers.map((_, c) =>
    Math.max(...all.map((row) => displayWidth(row[c]))),
  )
  const border = (l: string, m: string, r: string) =>
    l + widths.map((w) => "─".repeat(w + 2)).join(m) + r
  const row = (cells: string[]) =>
    `│${cells.map((cell, c) => ` ${pad(cell, widths[c], aligns[c])} `).join("│")}│`
  return [
    border("┌", "┬", "┐"),
    row(headers),
    border("├", "┼", "┤"),
    ...body.map(row),
    ...(showTotal ? [border("├", "┼", "┤"), row(totalRow)] : []),
    border("└", "┴", "┘"),
  ].join("\n")
}

export function toList(
  item: Item,
  showTotal: boolean,
  showUnit: boolean,
  bagName: string,
  t: TFunction,
): string {
  const d = showUnit ? "$" : ""
  const lines = toRows(item, bagName).map(
    (r) => `- ${r.name}: ${r.qty} x ${d}${r.price} = ${d}${r.total}`,
  )
  if (showTotal) lines.push(`- ${t("copy.total")}: ${d}${item.total}`)
  return lines.join("\n")
}

// JSON output has no total row, so showTotal is ignored.
export function toJson(
  item: Item,
  _showTotal: boolean,
  showUnit: boolean,
  bagName: string,
  _t: TFunction,
): string {
  const data = toRows(item, bagName).map((r) => ({
    item: r.name,
    price: showUnit ? `$${r.price}` : r.price,
    amount: r.qty,
  }))
  return JSON.stringify(data, null, 2)
}

export const formats = {
  markdown: toMarkdown,
  table: toBoxTable,
  list: toList,
  json: toJson,
}
