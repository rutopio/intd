import {
  ArrowsClockwiseIcon,
  CurrencyCircleDollarIcon,
} from "@phosphor-icons/react"
import { createFileRoute } from "@tanstack/react-router"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useState } from "react"
import { z } from "zod"
import { SettingsDialog } from "@/components/settings-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
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
import { decompose, type Item, keyOf } from "@/lib/decompose"

export const Route = createFileRoute("/")({ component: App })

type Row = { name: string; qty: number; price: number; total: number }

const amountSchema = z.coerce
  .number({ message: "請輸入金額" })
  .int("金額必須為整數")
  .positive("金額必須大於 0")
  .max(99999, "金額上限為99999")

function isItem(x: unknown): x is Item {
  return typeof x === "object" && x !== null && Array.isArray((x as Item).lines)
}

function toRows(item: Item): Row[] {
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

const fmt = (n: number) => n.toLocaleString("en-US")

const CN_DIGITS = ["", "壹", "貳", "參", "肆", "伍", "陸", "柒", "捌", "玖"]

const cnDigit = (d: number) => CN_DIGITS[d] ?? ""

function cnSlots(n: number) {
  const yuan = n % 10
  const shi = Math.floor(n / 10) % 10
  const bai = Math.floor(n / 100) % 10
  const qian = Math.floor(n / 1000) % 10
  const wan = Math.floor(n / 10000)
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
  const [nonce, setNonce] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [target, setTarget] = useLocalStorage<number | null>(
    "idc:target",
    null,
  )
  const [seen, setSeen] = useLocalStorage<string[]>("idc:seen", [])
  const [offset, setOffset] = useLocalStorage<number>("idc:offset", 0)
  const { items } = useSettings()
  const reduce = useReducedMotion()

  const safeResults = results?.every(isItem) ? results : null

  const handleSubmit = () => {
    const parsed = amountSchema.safeParse(amount.trim())
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      return
    }
    setError(null)
    const t = parsed.data
    const picks = decompose(t, items)
    setTarget(t)
    setSeen(picks.map(keyOf))
    setResults(picks)
    setOffset(0)
    setNonce((n) => n + 1)
  }

  const handleShuffle = () => {
    if (target === null) return
    const seenSet = new Set(seen)
    const picks = decompose(target, items, seenSet)
    if (picks.length === 0) return
    for (const p of picks) seenSet.add(keyOf(p))
    setSeen([...seenSet])
    setOffset((o) => o + (results?.length ?? 0))
    setResults(picks)
    setNonce((n) => n + 1)
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6 sm:p-12">
      <div className="flex items-start gap-2">
        <div className="flex flex-col gap-1">
          <InputGroup className="w-auto" aria-invalid={error !== null}>
            <InputGroupAddon>
              <CurrencyCircleDollarIcon />
            </InputGroupAddon>
            <InputGroupInput
              autoFocus
              type="text"
              inputMode="numeric"
              placeholder="輸入金額"
              aria-invalid={error !== null}
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
            <p className="px-1 text-destructive text-xs" role="alert">
              {error}
            </p>
          )}
        </div>
        <SettingsDialog />
      </div>

      <div className="flex min-h-[20rem] w-full flex-col items-center gap-6">
        {safeResults !== null &&
          (safeResults.length === 0 ? (
            <p className="text-muted-foreground text-sm">無法湊出此價格</p>
          ) : (
            <>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={nonce}
                  className="flex flex-col items-stretch justify-center gap-4 lg:flex-row"
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
                      className="flex"
                    >
                      <Card className="h-full w-72">
                        <CardHeader>
                          <CardTitle>
                            <Badge className="rounded-full">
                              {offset + idx + 1}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>品名</TableHead>
                                <TableHead className="text-right">
                                  數量
                                </TableHead>
                                <TableHead className="text-right">
                                  單價
                                </TableHead>
                                <TableHead className="text-right">
                                  總價
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {toRows(item).map((row) => (
                                <TableRow key={row.name}>
                                  <TableCell>{row.name}</TableCell>
                                  <TableCell className="text-right font-mono">
                                    {fmt(row.qty)}
                                  </TableCell>
                                  <TableCell className="text-right font-mono">
                                    {fmt(row.price)}
                                  </TableCell>
                                  <TableCell className="text-right font-mono">
                                    {fmt(row.total)}
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
              >
                <motion.span
                  key={nonce}
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="inline-flex"
                >
                  <ArrowsClockwiseIcon />
                </motion.span>
                新組合
              </Button>
              {(() => {
                const s = cnSlots(safeResults[0].total)
                const cells: {
                  id: string
                  char: string
                  unit?: boolean
                }[] = [
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
                return (
                  <div className="flex flex-col gap-2">
                    <p className="text-muted-foreground text-sm">合計 新台幣</p>
                    <div className="flex">
                      {cells.map((c) => (
                        <span
                          key={c.id}
                          className={`-ms-px flex size-18 items-center justify-center border text-3xl first:ms-0 ${
                            c.unit ? "font-light" : "font-bold text-primary/80"
                          }`}
                        >
                          {c.char}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </>
          ))}
      </div>
    </div>
  )
}
