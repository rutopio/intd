export type ItemConfig = {
  name: string
  min: number
  max: number
  digits: number[]
}

export type Line = { name: string; price: number; qty: number }

export type Item = {
  lines: Line[]
  bags: number
  total: number
  balanceScore: number
}

const MAX_BAGS = 4

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

  function dfs(i: number, remaining: number) {
    if (i === items.length) {
      const bags = remaining
      if (bags < 0 || bags > MAX_BAGS) return
      const qtys = lines.map((l) => l.qty)
      const totalQty = qtys.reduce((a, b) => a + b, 0)
      if (totalQty === 0) return
      if (bags > totalQty) return
      const balanceScore = Math.max(...qtys) - Math.min(...qtys)
      results.push({
        lines: lines.map((l) => ({ ...l })),
        bags,
        total: target,
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

function comboOf(item: Item): string {
  return item.lines
    .filter((l) => l.qty > 0)
    .map((l) => `${l.name}@${l.price}`)
    .sort()
    .join("_")
}

function pickThree(candidates: Item[], exclude: Set<string>): Item[] {
  const avail = candidates
    .filter((c) => !exclude.has(keyOf(c)))
    .sort((a, b) => {
      if (a.balanceScore !== b.balanceScore)
        return a.balanceScore - b.balanceScore
      return a.bags - b.bags
    })
  if (avail.length === 0) return []

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

export function decompose(
  target: number,
  items: ItemConfig[],
  exclude?: Set<string>,
): Item[] {
  return pickThree(solve(target, items), exclude ?? new Set())
}
