export type ItemConfig = {
  name: string
  min: number
  max: number
  digits: number[]
}

export type Line = { name: string; price: number; qty: number }

export type Item = {
  lines: Line[] // includes qty=0 lines; filtered when displayed
  bags: number // built-in plastic bags, $1 each, 0..4
  total: number
  balanceScore: number // max-min of the quantities; smaller is more balanced
}

const MAX_BAGS = 4

// Legal prices for an item: values in [min,max] whose last digit is in digits.
function pricesFor(config: ItemConfig): number[] {
  const prices: number[] = []
  for (let p = config.min; p <= config.max; p++) {
    if (config.digits.includes(p % 10)) prices.push(p)
  }
  return prices
}

function solve(target: number, items: ItemConfig[]): Item[] {
  const results: Item[] = []
  if (items.length === 0) return results
  const priceLists = items.map(pricesFor)
  const lines: Line[] = items.map((it) => ({
    name: it.name,
    price: 0,
    qty: 0,
  }))

  // For each item, pick "skip (qty=0)" or "a price x a positive quantity".
  // Whatever remains is covered by plastic bags (0..MAX_BAGS).
  function dfs(i: number, remaining: number) {
    if (i === items.length) {
      const bags = remaining
      if (bags < 0 || bags > MAX_BAGS) return
      const qtys = lines.map((l) => l.qty)
      const totalQty = qtys.reduce((a, b) => a + b, 0)
      if (totalQty === 0) return // bags alone is not allowed
      if (bags > totalQty) return // bags must not outnumber the items
      const balanceScore = Math.max(...qtys) - Math.min(...qtys)
      results.push({
        lines: lines.map((l) => ({ ...l })),
        bags,
        total: target, // Σ price*qty + bags always equals target
        balanceScore,
      })
      return
    }

    lines[i] = { name: items[i].name, price: 0, qty: 0 }
    dfs(i + 1, remaining)

    for (const price of priceLists[i]) {
      const maxQty = Math.floor(remaining / price)
      for (let q = 1; q <= maxQty; q++) {
        lines[i] = { name: items[i].name, price, qty: q }
        dfs(i + 1, remaining - price * q)
      }
    }

    lines[i] = { name: items[i].name, price: 0, qty: 0 }
  }

  dfs(0, target)
  return results
}

export function keyOf(item: Item): string {
  const parts = item.lines
    .filter((l) => l.qty > 0)
    .map((l) => `${l.name}@${l.price}x${l.qty}`)
    .sort()
  return `${parts.join("_")}|bags${item.bags}`
}

// Price-only signature (ignores quantities), used for diversity when picking.
function comboOf(item: Item): string {
  return item.lines
    .filter((l) => l.qty > 0)
    .map((l) => `${l.name}@${l.price}`)
    .sort()
    .join("_")
}

function pickThree(candidates: Item[], exclude: Set<string>): Item[] {
  // Drop already-seen solutions, then sort by balance (then fewer bags) first.
  const avail = candidates
    .filter((c) => !exclude.has(keyOf(c)))
    .sort((a, b) => {
      if (a.balanceScore !== b.balanceScore)
        return a.balanceScore - b.balanceScore
      return a.bags - b.bags
    })
  if (avail.length === 0) return []

  // Take three, preferring distinct price combos; relax that to fill if short.
  const picks: Item[] = []
  const fill = (allowSameCombo: boolean) => {
    for (const c of avail) {
      if (picks.length >= 3) return
      if (picks.some((p) => keyOf(p) === keyOf(c))) continue
      const sameCombo = picks.some((p) => comboOf(p) === comboOf(c))
      if (!allowSameCombo && sameCombo) continue
      picks.push(c)
    }
  }
  fill(false)
  fill(true)

  return picks
}

// exclude holds already-seen solution keys; pass it to get a fresh batch.
export function decompose(
  target: number,
  items: ItemConfig[],
  exclude?: Set<string>,
): Item[] {
  return pickThree(solve(target, items), exclude ?? new Set())
}
