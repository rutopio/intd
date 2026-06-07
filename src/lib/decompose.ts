export type Item = {
  bentoPrice: number
  bentoQty: number
  drinkPrice: number
  drinkQty: number
  bags: number
  total: number
  balanceScore: number
}

const BENTO_PRICES = Array.from({ length: 61 }, (_, i) => i + 90).filter(
  (p) => p % 10 === 0 || p % 10 === 5 || p % 10 === 9,
)

const DRINK_PRICES = Array.from({ length: 51 }, (_, i) => i + 40).filter(
  (p) => p % 10 === 0 || p % 10 === 5,
)

function solve(target: number): Item[] {
  const results: Item[] = []

  for (const bentoPrice of BENTO_PRICES) {
    for (const drinkPrice of DRINK_PRICES) {
      const maxBento = Math.floor(target / bentoPrice)

      for (let b = 0; b <= maxBento; b++) {
        const afterBento = target - bentoPrice * b
        if (afterBento < 0) break

        for (let bags = 0; bags <= 4; bags++) {
          const afterBags = afterBento - bags
          if (afterBags < 0) break

          if (afterBags % drinkPrice !== 0) continue
          const d = afterBags / drinkPrice

          if (b === 0 && d === 0) continue

          if (bags > b + d) continue

          const balanceScore = Math.abs(b - d)

          results.push({
            bentoPrice,
            bentoQty: b,
            drinkPrice,
            drinkQty: d,
            bags,
            total: bentoPrice * b + drinkPrice * d + bags,
            balanceScore,
          })
        }
      }
    }
  }

  return results
}

export function keyOf(item: Item): string {
  return `${item.bentoPrice}x${item.bentoQty}_${item.drinkPrice}x${item.drinkQty}_${item.bags}`
}

function pickThree(candidates: Item[], exclude: Set<string>): Item[] {
  const avail = candidates.filter((c) => !exclude.has(keyOf(c)))
  if (avail.length === 0) return []

  const both = avail.filter((c) => c.bentoQty > 0 && c.drinkQty > 0)
  const bentoOnly = avail.filter((c) => c.bentoQty > 0 && c.drinkQty === 0)
  const drinkOnly = avail.filter((c) => c.bentoQty === 0 && c.drinkQty > 0)

  const byBalance = (a: Item, b: Item) => {
    if (a.balanceScore !== b.balanceScore)
      return a.balanceScore - b.balanceScore
    return a.bags - b.bags
  }

  both.sort(byBalance)
  bentoOnly.sort(byBalance)
  drinkOnly.sort(byBalance)

  const picks: Item[] = []

  if (both.length > 0) picks.push(both[0])

  if (bentoOnly.length > 0) picks.push(bentoOnly[0])

  if (drinkOnly.length > 0) picks.push(drinkOnly[0])

  if (picks.length < 3 && both.length > 1) {
    for (const c of both.slice(1)) {
      if (picks.some((p) => keyOf(p) === keyOf(c))) continue
      const sameCombo = picks.some(
        (p) => p.bentoPrice === c.bentoPrice && p.drinkPrice === c.drinkPrice,
      )
      if (!sameCombo) {
        picks.push(c)
        break
      }
    }
  }

  return picks.slice(0, 3)
}

export function decompose(target: number, exclude?: Set<string>): Item[] {
  return pickThree(solve(target), exclude ?? new Set())
}
