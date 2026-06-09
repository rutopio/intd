import { motion } from "motion/react"
import { cnSlots } from "@/lib/cn-amount"

// Chinese uppercase amount strip (新台幣…元整). A zh-only convention; the caller
// hides it on the English page. runId replays the enter animation on a fresh run.
export function AmountInWords({
  total,
  runId,
  reduce,
}: {
  total: number
  runId: number
  reduce: boolean
}) {
  const s = cnSlots(total)
  // One cell per character forming a grid: [digit, unit, digit, unit, ...].
  // Digit cells are bold, unit cells font-light, empty stays blank. id is a stable key.
  const cells: { id: string; char: string; unit?: boolean }[] = [
    { id: "currency-1", char: "新", unit: true },
    { id: "currency-2", char: "台", unit: true },
    { id: "currency-3", char: "幣", unit: true },
    { id: "ten-thousand-digit", char: s.wan },
    { id: "ten-thousand", char: "萬", unit: true },
    { id: "thousand-digit", char: s.qian },
    { id: "thousand", char: "仟", unit: true },
    { id: "hundred-digit", char: s.bai },
    { id: "hundred", char: "佰", unit: true },
    { id: "ten-digit", char: s.shi },
    { id: "ten", char: "拾", unit: true },
    { id: "dollar-digit", char: s.yuan },
    { id: "dollar", char: "元", unit: true },
    { id: "exact", char: "整", unit: true },
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
    <motion.div
      // Replay the enter on a fresh decompose, like the cards above.
      key={runId}
      layout={!reduce}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="flex w-full flex-col gap-2 lg:w-auto"
    >
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
    </motion.div>
  )
}
