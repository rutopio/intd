import { ArrowsClockwiseIcon } from "@phosphor-icons/react"
import { createFileRoute } from "@tanstack/react-router"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { decompose, type Item, keyOf } from "@/lib/decompose"

export const Route = createFileRoute("/")({ component: App })

type Row = { name: string; qty: number; price: number; total: number }

function toRows(item: Item): Row[] {
  const rows: Row[] = []
  if (item.bentoQty > 0)
    rows.push({
      name: "便當",
      qty: item.bentoQty,
      price: item.bentoPrice,
      total: item.bentoPrice * item.bentoQty,
    })
  if (item.drinkQty > 0)
    rows.push({
      name: "飲料",
      qty: item.drinkQty,
      price: item.drinkPrice,
      total: item.drinkPrice * item.drinkQty,
    })
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
  const [target, setTarget] = useLocalStorage<number | null>(
    "idc:target",
    null,
  )
  const [seen, setSeen] = useLocalStorage<string[]>("idc:seen", [])
  const reduce = useReducedMotion()

  const handleSubmit = () => {
    const t = Number(amount)
    if (!Number.isInteger(t) || t <= 0) return
    const picks = decompose(t)
    setTarget(t)
    setSeen(picks.map(keyOf))
    setResults(picks)
    setNonce((n) => n + 1)
  }

  const handleShuffle = () => {
    if (target === null) return
    const seenSet = new Set(seen)
    const picks = decompose(target, seenSet)
    if (picks.length === 0) return
    for (const p of picks) seenSet.add(keyOf(p))
    setSeen([...seenSet])
    setResults(picks)
    setNonce((n) => n + 1)
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6 sm:p-12">
      <Field orientation="horizontal" className="w-auto">
        <Input
          autoFocus
          type="number"
          placeholder="輸入金額"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        <Button onClick={handleSubmit}>分解</Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="換一批組合"
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
        </Button>
      </Field>

      <div className="flex min-h-[20rem] w-full flex-col items-center gap-6">
        {results !== null &&
          (results.length === 0 ? (
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
                  {results.map((item, idx) => (
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
                            <Badge className="rounded-full">{idx + 1}</Badge>
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
              {(() => {
                const s = cnSlots(results[0].total)
                const slot = (v: string) =>
                  v ? (
                    <span className="text-primary/80">{v}</span>
                  ) : (
                    <span>─</span>
                  )
                return (
                  <p className="text-sm leading-loose">
                    合計 新台幣 {slot(s.wan)}萬 {slot(s.qian)}仟 {slot(s.bai)}佰{" "}
                    {slot(s.shi)}拾 {slot(s.yuan)}元整
                  </p>
                )
              })()}
            </>
          ))}
      </div>
    </div>
  )
}
