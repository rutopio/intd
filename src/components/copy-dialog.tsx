import { CopyIcon } from "@phosphor-icons/react"
import { useState } from "react"
import { toast } from "sonner"
import { JsonHighlight } from "@/components/json-highlight"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useIsMobile } from "@/hooks/use-mobile"
import { useSettings } from "@/hooks/use-settings"
import type { Item } from "@/lib/decompose"
import { toRows } from "@/lib/rows"

function toMarkdown(
  item: Item,
  showTotal: boolean,
  showUnit: boolean,
  bagName: string,
): string {
  const d = showUnit ? "$" : ""
  const rows = toRows(item, bagName)
  const header = "| 品名 | 數量 | 單價 | 總價 |"
  const divider = "| --- | ---: | ---: | ---: |"
  const body = rows.map(
    (r) => `| ${r.name} | ${r.qty} | ${d}${r.price} | ${d}${r.total} |`,
  )
  const total = `| 合計 |  |  | ${d}${item.total} |`
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

function toBoxTable(
  item: Item,
  showTotal: boolean,
  showUnit: boolean,
  bagName: string,
): string {
  const d = showUnit ? "$" : ""
  const headers = ["品名", "數量", "單價", "總價"]
  const aligns = ["left", "right", "right", "right"] as const
  const body = toRows(item, bagName).map((r) => [
    r.name,
    String(r.qty),
    `${d}${r.price}`,
    `${d}${r.total}`,
  ])
  const totalRow = ["合計", "", "", `${d}${item.total}`]
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

function toList(
  item: Item,
  showTotal: boolean,
  showUnit: boolean,
  bagName: string,
): string {
  const d = showUnit ? "$" : ""
  const lines = toRows(item, bagName).map(
    (r) => `- ${r.name}: ${r.qty} x ${d}${r.price} = ${d}${r.total}`,
  )
  if (showTotal) lines.push(`- 合計: ${d}${item.total}`)
  return lines.join("\n")
}

// JSON output has no total row, so showTotal is ignored.
function toJson(
  item: Item,
  _showTotal: boolean,
  showUnit: boolean,
  bagName: string,
): string {
  const data = toRows(item, bagName).map((r) => ({
    item: r.name,
    price: showUnit ? `$${r.price}` : r.price,
    amount: showUnit ? `$${r.qty}` : r.qty,
  }))
  return JSON.stringify(data, null, 2)
}

const formats = {
  markdown: toMarkdown,
  table: toBoxTable,
  list: toList,
  json: toJson,
}

// Display names for the copied-format toast, keyed by tab value.
const FORMAT_LABELS: Record<string, string> = {
  markdown: "Markdown",
  table: "表格",
  list: "列表",
  json: "JSON",
}

export function CopyDialog({
  item,
  onClose,
}: {
  item: Item | null
  onClose: () => void
}) {
  const [tab, setTab] = useState("markdown")
  const [showTotal, setShowTotal] = useState(true)
  const [showUnit, setShowUnit] = useState(true)
  const isMobile = useIsMobile()
  const { bagName } = useSettings()

  const handleCopy = async () => {
    if (!item) return
    const text = formats[tab as keyof typeof formats](
      item,
      showTotal,
      showUnit,
      bagName,
    )
    try {
      await navigator.clipboard.writeText(text)
      toast.success("已複製", { description: `格式：${FORMAT_LABELS[tab]}` })
      onClose()
    } catch {
      toast.error("複製失敗")
    }
  }

  const body = (
    <>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full">
          <TabsTrigger value="markdown">Markdown</TabsTrigger>
          <TabsTrigger value="table">表格</TabsTrigger>
          <TabsTrigger value="list">列表</TabsTrigger>
          <TabsTrigger value="json">JSON</TabsTrigger>
        </TabsList>
        {(["markdown", "table", "list", "json"] as const).map((v) => (
          <TabsContent key={v} value={v}>
            {item &&
              (v === "json" ? (
                <JsonHighlight
                  code={formats[v](item, showTotal, showUnit, bagName)}
                />
              ) : (
                <pre className="max-h-64 overflow-auto rounded-md bg-muted p-3 font-mono text-xs">
                  {formats[v](item, showTotal, showUnit, bagName)}
                </pre>
              ))}
          </TabsContent>
        ))}
      </Tabs>
      <div
        className={`flex items-center gap-2 ${tab === "json" ? "opacity-50" : ""}`}
      >
        <Switch
          id="show-total"
          checked={showTotal}
          onCheckedChange={setShowTotal}
          disabled={tab === "json"}
        />
        <Label htmlFor="show-total">顯示「合計」列</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          id="show-unit"
          checked={showUnit}
          onCheckedChange={setShowUnit}
        />
        <Label htmlFor="show-unit">顯示 $ 符號</Label>
      </div>
      <Button className="w-full" onClick={handleCopy}>
        <CopyIcon aria-hidden="true" />
        複製
      </Button>
    </>
  )

  if (isMobile) {
    return (
      <Drawer open={item !== null} onOpenChange={(o) => !o && onClose()}>
        <DrawerContent className="text-left">
          <DrawerHeader className="text-left">
            <DrawerTitle>複製表格</DrawerTitle>
          </DrawerHeader>
          <div className="flex flex-col gap-4 px-4 pb-6">{body}</div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={item !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>複製表格</DialogTitle>
        </DialogHeader>
        {body}
      </DialogContent>
    </Dialog>
  )
}
