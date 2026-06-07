import { useRef, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { ArrowsClockwiseIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { decompose, keyOf, type Item } from "@/lib/decompose"

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

function App() {
  const [amount, setAmount] = useState("")
  const [results, setResults] = useState<Item[] | null>(null)
  const [nonce, setNonce] = useState(0)
  const targetRef = useRef<number | null>(null)
  const seenRef = useRef<Set<string>>(new Set())
  const reduce = useReducedMotion()

  const handleSubmit = () => {
    const target = Number(amount)
    if (!Number.isInteger(target) || target <= 0) return
    targetRef.current = target
    seenRef.current = new Set()
    const picks = decompose(target)
    picks.forEach((p) => seenRef.current.add(keyOf(p)))
    setResults(picks)
    setNonce((n) => n + 1)
  }

  const handleShuffle = () => {
    if (targetRef.current === null) return
    const picks = decompose(targetRef.current, seenRef.current)
    if (picks.length === 0) return
    picks.forEach((p) => seenRef.current.add(keyOf(p)))
    setResults(picks)
    setNonce((n) => n + 1)
  }

  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-6 p-6">
      <Field orientation="horizontal" className="w-auto">
        <Input
          type="number"
          placeholder="輸入金額"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        <Button onClick={handleSubmit}>拆解</Button>
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

      {results !== null &&
        (results.length === 0 ? (
          <p className="text-muted-foreground text-sm">無法湊出此價格</p>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={nonce}
              className="flex flex-wrap justify-center gap-4"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {results.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.18,
                    delay: reduce ? 0 : idx * 0.06,
                    ease: "easeOut",
                  }}
                >
                  <Card className="w-72">
                <CardHeader>
                  <CardTitle>
                    方案 {idx + 1}（合計{" "}
                    <span className="font-mono">{fmt(item.total)}</span> 元）
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>品名</TableHead>
                        <TableHead className="text-right">數量</TableHead>
                        <TableHead className="text-right">單價</TableHead>
                        <TableHead className="text-right">總價</TableHead>
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
        ))}
    </div>
  )
}
