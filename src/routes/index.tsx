import {
  ArrowsClockwiseIcon,
  CopyIcon,
  CurrencyCircleDollarIcon,
  ReceiptXIcon,
} from "@phosphor-icons/react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { z } from "zod"
import { CopyDialog } from "@/components/copy-dialog"
import { SettingsDialog } from "@/components/settings-dialog"
import { ShareButton } from "@/components/share-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useSettings } from "@/hooks/use-settings"
import { decompose, type Item, keyOf, type SortMode } from "@/lib/decompose"
import { fmt, toRows } from "@/lib/rows"
import { clearSession } from "@/lib/session"

const searchSchema = z.object({
  p: z.coerce.number().int().positive().max(99999).optional().catch(undefined),
})

export const Route = createFileRoute("/")({
  component: App,
  validateSearch: searchSchema,
})

const amountSchema = z.coerce
  .number({ message: "請輸入金額" })
  .int("金額必須為整數")
  .positive("金額必須大於 0")
  .max(99999, "金額上限為99999")

// Old persisted data has no lines field; filter it out so rendering does not crash.
function isItem(x: unknown): x is Item {
  return typeof x === "object" && x !== null && Array.isArray((x as Item).lines)
}

const CN_DIGITS = ["", "壹", "貳", "參", "肆", "伍", "陸", "柒", "捌", "玖"]

const cnDigit = (d: number) => CN_DIGITS[d] ?? ""

// Split into the wan/qian/bai/shi/yuan slots; the wan slot holds every digit at the 10000s place and above.
function cnSlots(n: number) {
  const yuan = n % 10
  const shi = Math.floor(n / 10) % 10
  const bai = Math.floor(n / 100) % 10
  const qian = Math.floor(n / 1000) % 10
  const wan = Math.floor(n / 10000) // 10000s place and above
  return {
    wan: wan > 0 ? String(wan).split("").map(Number).map(cnDigit).join("") : "",
    qian: cnDigit(qian),
    bai: cnDigit(bai),
    shi: cnDigit(shi),
    yuan: cnDigit(yuan),
  }
}

function App() {
  const [amount, setAmount] = useLocalStorage("idc:amount", "")
  const [results, setResults] = useLocalStorage<Item[] | null>(
    "idc:results",
    null,
  )
  const [nonce, setNonce] = useState(0) // bump per result to replay the enter animation
  const [error, setError] = useState<string | null>(null)
  const [shareItem, setShareItem] = useState<Item | null>(null)
  // Persist target and seen too, so returning to the page can shuffle forward without repeating old combos.
  const [target, setTarget] = useLocalStorage<number | null>(
    "idc:target",
    null,
  )
  const [seen, setSeen] = useLocalStorage<string[]>("idc:seen", [])
  // Starting offset for badge numbers accumulated across batches.
  const [offset, setOffset] = useLocalStorage<number>("idc:offset", 0)
  // Decomposition preference: fewer plastic bags vs. more balanced quantities.
  const [sortMode, setSortMode] = useLocalStorage<SortMode>(
    "idc:sortMode",
    "bags",
  )
  const { items, bagName } = useSettings()
  const reduce = useReducedMotion()
  const navigate = useNavigate({ from: Route.fullPath })
  const { p } = Route.useSearch()

  // Drop leftover results in the old format (no lines field) to avoid render crashes.
  const safeResults = results?.every(isItem) ? results : null

  const runDecompose = (t: number, mode: SortMode = sortMode) => {
    const picks = decompose(t, items, undefined, mode)
    setTarget(t)
    setSeen(picks.map(keyOf))
    setResults(picks)
    setOffset(0) // new run, numbering restarts from 1
    setNonce((n) => n + 1)
  }

  // Switch the decomposition strategy and re-run immediately if a target exists.
  const handleSortModeChange = (mode: SortMode) => {
    setSortMode(mode)
    if (target !== null) runDecompose(target, mode)
  }

  const handleSubmit = () => {
    // Pressing 分解 with an empty input clears the session back to its initial state.
    if (amount.trim() === "") {
      clearSession()
      setError(null)
      navigate({ search: {}, replace: true })
      toast.success("已清除所有分解結果")
      return
    }
    const parsed = amountSchema.safeParse(amount.trim())
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      return
    }
    setError(null)
    const t = parsed.data
    runDecompose(t)
    // Write the amount into the query string so it can be shared and restored on reload.
    navigate({ search: { p: t }, replace: true })
  }

  // On entry, reconcile the URL and the persisted state so they always agree:
  // - ?p= present: prefill and auto-decompose once (the URL wins).
  // - ?p= absent but a previously decomposed amount is persisted: write it back
  //   into the URL so the address matches the results already on screen.
  const didInit = useRef(false)
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs once on entry, not on dependency changes
  useEffect(() => {
    if (didInit.current) return
    didInit.current = true
    if (p !== undefined) {
      setAmount(String(p))
      setError(null)
      runDecompose(p)
      return
    }
    if (target !== null) {
      navigate({ search: { p: target }, replace: true })
    }
  }, [])

  const handleShuffle = () => {
    if (target === null) return
    const seenSet = new Set(seen)
    const picks = decompose(target, items, seenSet, sortMode)
    if (picks.length === 0) return // no other combos left, keep current results
    for (const pick of picks) seenSet.add(keyOf(pick))
    setSeen([...seenSet])
    // Continue numbering from the previous batch by adding the current count.
    setOffset((o) => o + (results?.length ?? 0))
    setResults(picks)
    setNonce((n) => n + 1)
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6 sm:p-12">
      <h1 className="sr-only">試算器金額分解試算器</h1>
      <div className="flex w-full flex-col gap-3 lg:max-w-md">
        <div className="flex w-full items-start justify-center gap-2">
          <div className="flex flex-1 flex-col gap-1">
            <InputGroup className="w-full" aria-invalid={error !== null}>
              <InputGroupAddon>
                <CurrencyCircleDollarIcon aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                autoFocus
                type="text"
                inputMode="numeric"
                placeholder="輸入金額"
                aria-label="金額"
                aria-invalid={error !== null}
                aria-describedby={error ? "amount-error" : undefined}
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                  if (error) setError(null)
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  variant="default"
                  className="text-xs"
                  onClick={handleSubmit}
                >
                  分解
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            {error && (
              <p
                id="amount-error"
                className="px-1 text-destructive text-xs"
                role="alert"
              >
                {error}
              </p>
            )}
          </div>
          <SettingsDialog />
          <ShareButton />
        </div>

        <RadioGroup
          value={sortMode}
          onValueChange={(v) => handleSortModeChange(v as SortMode)}
          aria-label="分解策略"
          data-mode={sortMode}
          className="group relative grid h-9 w-full grid-cols-2 items-center gap-0 rounded-md bg-input/50 p-0.5 font-medium text-sm after:absolute after:inset-y-0.5 after:left-0.5 after:w-[calc(50%-2px)] after:rounded-sm after:bg-background after:shadow-xs after:transition-[translate] after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)] data-[mode=balance]:after:translate-x-full"
        >
          <label
            htmlFor="sort-bags"
            className="relative z-10 inline-flex h-full cursor-pointer select-none items-center justify-center whitespace-nowrap text-muted-foreground transition-colors has-data-checked:text-foreground"
          >
            塑膠袋最少優先
            <RadioGroupItem id="sort-bags" className="sr-only" value="bags" />
          </label>
          <label
            htmlFor="sort-balance"
            className="relative z-10 inline-flex h-full cursor-pointer select-none items-center justify-center whitespace-nowrap text-muted-foreground transition-colors has-data-checked:text-foreground"
          >
            品項數目平衡優先
            <RadioGroupItem
              id="sort-balance"
              className="sr-only"
              value="balance"
            />
          </label>
        </RadioGroup>
        <p className="px-1 text-center text-muted-foreground text-xs leading-relaxed">
          {sortMode === "bags"
            ? "優先湊出塑膠袋數量最少的組合，數量平衡為次要考量。"
            : "優先湊出各品項數量盡量平均的組合，塑膠袋數量次之。"}
        </p>
      </div>

      <div className="flex min-h-[26rem] w-full flex-col items-center gap-6">
        {safeResults !== null &&
          (safeResults.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ReceiptXIcon aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>無法湊出此價格</EmptyTitle>
                <EmptyDescription>
                  試著調整金額，或到設定中調整品項價格區間。
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={nonce}
                  className="flex w-full flex-col items-stretch justify-center gap-4 lg:w-auto lg:flex-row"
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  {safeResults.map((item, idx) => (
                    <motion.div
                      key={keyOf(item)}
                      initial={reduce ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.18,
                        delay: reduce ? 0 : idx * 0.06,
                        ease: "easeOut",
                      }}
                      className="flex w-full lg:w-auto"
                    >
                      <Card className="h-full w-full lg:w-auto lg:min-w-72">
                        <CardHeader className="flex flex-row items-center justify-between">
                          <CardTitle>
                            <Badge className="rounded-full">
                              {offset + idx + 1}
                            </Badge>
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="複製表格"
                            className="text-muted-foreground"
                            onClick={() => setShareItem(item)}
                          >
                            <CopyIcon aria-hidden="true" />
                          </Button>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>品名</TableHead>
                                <TableHead className="pl-4 text-right">
                                  數量
                                </TableHead>
                                <TableHead className="pl-4 text-right">
                                  單價
                                </TableHead>
                                <TableHead className="pl-4 text-right">
                                  總價
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {toRows(item, bagName).map((row) => (
                                <TableRow key={row.name}>
                                  <TableCell className="lg:whitespace-nowrap">
                                    {row.name}
                                  </TableCell>
                                  <TableCell className="pl-4 text-right font-mono tabular-nums">
                                    {fmt(row.qty)}
                                  </TableCell>
                                  <TableCell className="pl-4 text-right font-mono tabular-nums">
                                    ${fmt(row.price)}
                                  </TableCell>
                                  <TableCell className="pl-4 text-right font-mono tabular-nums">
                                    ${fmt(row.total)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
              <Button
                variant="outline"
                disabled={results === null}
                onClick={handleShuffle}
                className="w-full lg:w-auto"
              >
                <motion.span
                  key={nonce}
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="inline-flex"
                >
                  <ArrowsClockwiseIcon aria-hidden="true" />
                </motion.span>
                新組合
              </Button>
              {(() => {
                const s = cnSlots(safeResults[0].total)
                // One cell per character forming a grid: [digit, unit, digit, unit, ...].
                // Digit cells are bold, unit cells font-light, empty stays blank. id is a stable key.
                const cells: {
                  id: string
                  char: string
                  unit?: boolean
                }[] = [
                  { id: "ntd-1", char: "新", unit: true },
                  { id: "ntd-2", char: "台", unit: true },
                  { id: "ntd-3", char: "幣", unit: true },
                  { id: "wan-n", char: s.wan },
                  { id: "wan", char: "萬", unit: true },
                  { id: "qian-n", char: s.qian },
                  { id: "qian", char: "仟", unit: true },
                  { id: "bai-n", char: s.bai },
                  { id: "bai", char: "佰", unit: true },
                  { id: "shi-n", char: s.shi },
                  { id: "shi", char: "拾", unit: true },
                  { id: "yuan-n", char: s.yuan },
                  { id: "yuan", char: "元", unit: true },
                  { id: "zheng", char: "整", unit: true },
                ]
                // On mobile, wrap after "仟": first row is NTD (3 cells) plus the first 4, rest on the second row.
                const rows = [cells.slice(0, 7), cells.slice(7)]
                // ms rule: the very first cell is not pulled in; each row's first cell is left-aligned on mobile
                // and shares an edge on desktop; all others use -ms-px.
                const msClass = (ri: number, ci: number) => {
                  if (ri === 0 && ci === 0) return ""
                  if (ci === 0) return "ms-0 lg:-ms-px"
                  return "-ms-px"
                }
                return (
                  <div className="flex w-full flex-col gap-2 lg:w-auto">
                    {/* <p className="text-muted-foreground text-sm">合計</p> */}
                    <div className="flex w-full flex-col items-start lg:w-auto lg:flex-row">
                      {rows.map((row, ri) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: fixed two rows, index is a stable key
                        <div key={ri} className="flex w-full lg:w-auto">
                          {row.map((c, ci) => (
                            <span
                              key={c.id}
                              // Mobile: each cell flexes to fill the row width (square via aspect ratio),
                              // so the whole strip is full-width like the shuffle button. Desktop: fixed size.
                              className={`flex aspect-square flex-1 items-center justify-center border text-[clamp(1.125rem,5vw,1.875rem)] leading-none lg:aspect-auto lg:size-16 lg:flex-none lg:text-3xl ${msClass(ri, ci)} ${
                                c.unit
                                  ? "bg-secondary font-light"
                                  : "font-bold text-foreground"
                              }`}
                            >
                              {c.char}
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </>
          ))}
      </div>

      <CopyDialog item={shareItem} onClose={() => setShareItem(null)} />
    </main>
  )
}
