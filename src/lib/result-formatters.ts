import type { TFunction } from "i18next";
import type { DecompositionResult } from "@/lib/decomposition";
import { getResultRows } from "@/lib/result-rows";

const WIDE_CHARACTER_RE = /[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹏＀-｠￠-￦]/;

// Pure formatters that turn a decomposition result into copyable text. No React
// here; the localized column labels come in via the passed t function.

export function toMarkdown(
  result: DecompositionResult,
  showTotal: boolean,
  showUnit: boolean,
  bagName: string,
  t: TFunction
): string {
  const currencyPrefix = showUnit ? "$" : "";
  const rows = getResultRows(result, bagName);
  const header = `| ${t("copy.colName")} | ${t("copy.colQty")} | ${t("copy.colPrice")} | ${t("copy.colTotal")} |`;
  const divider = "| --- | ---: | ---: | ---: |";
  const body = rows.map(
    (r) =>
      `| ${r.name} | ${r.qty} | ${currencyPrefix}${r.price} | ${currencyPrefix}${r.total} |`
  );
  const total = `| ${t("copy.total")} |  |  | ${currencyPrefix}${result.total} |`;
  return [header, divider, ...body, ...(showTotal ? [total] : [])].join("\n");
}

// CJK and fullwidth characters take 2 columns, everything else 1.
function displayWidth(s: string): number {
  let w = 0;
  for (const ch of s) {
    w += WIDE_CHARACTER_RE.test(ch) ? 2 : 1;
  }
  return w;
}

function pad(s: string, width: number, align: "left" | "right"): string {
  const fill = " ".repeat(Math.max(0, width - displayWidth(s)));
  return align === "right" ? fill + s : s + fill;
}

export function toBoxTable(
  result: DecompositionResult,
  showTotal: boolean,
  showUnit: boolean,
  bagName: string,
  t: TFunction
): string {
  const currencyPrefix = showUnit ? "$" : "";
  const headers = [
    t("copy.colName"),
    t("copy.colQty"),
    t("copy.colPrice"),
    t("copy.colTotal"),
  ];
  const aligns = ["left", "right", "right", "right"] as const;
  const body = getResultRows(result, bagName).map((r) => [
    r.name,
    String(r.qty),
    `${currencyPrefix}${r.price}`,
    `${currencyPrefix}${r.total}`,
  ]);
  const totalRow = [
    t("copy.total"),
    "",
    "",
    `${currencyPrefix}${result.total}`,
  ];
  const all = [headers, ...body, ...(showTotal ? [totalRow] : [])];
  const widths = headers.map((_, c) =>
    Math.max(...all.map((row) => displayWidth(row[c] ?? "")))
  );
  const border = (l: string, m: string, r: string) =>
    l + widths.map((w) => "─".repeat(w + 2)).join(m) + r;
  const row = (cells: string[]) =>
    `│${cells.map((cell, c) => ` ${pad(cell, widths[c] ?? 0, aligns[c] ?? "left")} `).join("│")}│`;
  return [
    border("┌", "┬", "┐"),
    row(headers),
    border("├", "┼", "┤"),
    ...body.map(row),
    ...(showTotal ? [border("├", "┼", "┤"), row(totalRow)] : []),
    border("└", "┴", "┘"),
  ].join("\n");
}

export function toList(
  result: DecompositionResult,
  showTotal: boolean,
  showUnit: boolean,
  bagName: string,
  t: TFunction
): string {
  const currencyPrefix = showUnit ? "$" : "";
  const lines = getResultRows(result, bagName).map(
    (r) =>
      `- ${r.name}: ${r.qty} x ${currencyPrefix}${r.price} = ${currencyPrefix}${r.total}`
  );
  if (showTotal)
    lines.push(`- ${t("copy.total")}: ${currencyPrefix}${result.total}`);
  return lines.join("\n");
}

// JSON output has no total row, so showTotal is ignored.
export function toJson(
  result: DecompositionResult,
  _showTotal: boolean,
  showUnit: boolean,
  bagName: string,
  _t: TFunction
): string {
  const data = getResultRows(result, bagName).map((r) => ({
    item: r.name,
    price: showUnit ? `$${r.price}` : r.price,
    amount: r.qty,
  }));
  return JSON.stringify(data, null, 2);
}

export const formats = {
  markdown: toMarkdown,
  table: toBoxTable,
  list: toList,
  json: toJson,
};
