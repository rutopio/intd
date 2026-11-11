import { MAX_BAGS } from "@/lib/constants";

export type DecompositionItemConfig = {
  name: string;
  min: number;
  max: number;
  digits: number[];
};

export type DecompositionLine = { name: string; price: number; qty: number };

export type DecompositionResult = {
  lines: DecompositionLine[]; // includes qty=0 lines; filtered when displayed
  bags: number; // built-in plastic bags, $1 each, 0..9
  total: number;
  balanceScore: number; // max-min of the quantities; smaller is more balanced
};

function getAllowedPrices(config: DecompositionItemConfig): number[] {
  const prices: number[] = [];
  for (let p = config.min; p <= config.max; p++) {
    if (config.digits.includes(p % 10)) prices.push(p);
  }
  return prices;
}

function findDecompositions(
  target: number,
  items: DecompositionItemConfig[]
): DecompositionResult[] {
  const results: DecompositionResult[] = [];
  if (items.length === 0) return results;
  const priceLists = items.map(getAllowedPrices);
  const lines: DecompositionLine[] = items.map((it) => ({
    name: it.name,
    price: 0,
    qty: 0,
  }));

  function dfs(i: number, remaining: number) {
    if (i === items.length) {
      const bags = remaining;
      if (bags < 0 || bags > MAX_BAGS) return;
      const qtys = lines.map((l) => l.qty);
      const totalQty = qtys.reduce((a, b) => a + b, 0);
      if (totalQty === 0) return; // bags alone is not allowed
      if (bags > totalQty) return; // bags must not outnumber the items
      const balanceScore = Math.max(...qtys) - Math.min(...qtys);
      results.push({
        lines: lines.map((l) => ({ ...l })),
        bags,
        total: target, // Σ price*qty + bags always equals target
        balanceScore,
      });
      return;
    }

    const itemConfig = items[i];
    const prices = priceLists[i];
    if (!itemConfig || !prices) return;
    lines[i] = { name: itemConfig.name, price: 0, qty: 0 };
    dfs(i + 1, remaining);

    for (const price of prices) {
      const maxQty = Math.floor(remaining / price);
      for (let q = 1; q <= maxQty; q++) {
        lines[i] = { name: itemConfig.name, price, qty: q };
        dfs(i + 1, remaining - price * q);
      }
    }

    lines[i] = { name: itemConfig.name, price: 0, qty: 0 };
  }

  dfs(0, target);
  return results;
}

export function getResultKey(result: DecompositionResult): string {
  const parts = result.lines
    .filter((l) => l.qty > 0)
    .map((l) => `${l.name}@${l.price}x${l.qty}`)
    .sort();
  return `${parts.join("_")}|bags${result.bags}`;
}

// Price-only signature (ignores quantities), used for diversity when picking.
function getPriceCombinationKey(result: DecompositionResult): string {
  return result.lines
    .filter((l) => l.qty > 0)
    .map((l) => `${l.name}@${l.price}`)
    .sort()
    .join("_");
}

export type SortMode = "bags" | "balance";

function selectThreeDiverseResults(
  candidates: DecompositionResult[],
  exclude: Set<string>,
  mode: SortMode
): DecompositionResult[] {
  const availableResults = candidates
    .filter((c) => !exclude.has(getResultKey(c)))
    .sort((a, b) => {
      if (mode === "bags") {
        if (a.bags !== b.bags) return a.bags - b.bags;
        return a.balanceScore - b.balanceScore;
      }
      if (a.balanceScore !== b.balanceScore)
        return a.balanceScore - b.balanceScore;
      return a.bags - b.bags;
    });
  if (availableResults.length === 0) return [];

  // Prefer distinct price combinations, then fill any remaining slots.
  const picks: DecompositionResult[] = [];
  const fill = (allowSameCombo: boolean) => {
    for (const c of availableResults) {
      if (picks.length >= 3) return;
      if (picks.some((p) => getResultKey(p) === getResultKey(c))) continue;
      const sameCombo = picks.some(
        (p) => getPriceCombinationKey(p) === getPriceCombinationKey(c)
      );
      if (!allowSameCombo && sameCombo) continue;
      picks.push(c);
    }
  };
  fill(false);
  fill(true);

  return picks;
}

export function decompose(
  target: number,
  items: DecompositionItemConfig[],
  exclude?: Set<string>,
  mode: SortMode = "bags"
): DecompositionResult[] {
  return selectThreeDiverseResults(
    findDecompositions(target, items),
    exclude ?? new Set(),
    mode
  );
}
