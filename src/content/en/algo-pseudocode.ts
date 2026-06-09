// Pseudocode body for algo.mdx, kept in a .ts file so markdown/MDX editor
// formatters never rewrite the underscores, asterisks, or indentation inside it.
export const algoPseudocode = `function decompose(T, items):          # items[1..n], each with a valid price set P_i
  candidates ← []

  function dfs(i, remaining):           # decide price and quantity of item i
    if i > n:                           # all items decided
      q_* ← remaining                   # remaining amount goes to plastic bags
      if q_* < 0 or q_* > 9: return
      if sum(q_i) = 0: return           # cannot be bags only
      if q_* > sum(q_i): return         # bags ≤ total item count
      balance ← max(q_i) - min(q_i)     # smaller is more balanced
      candidates.push({ p_i, q_i, q_*, balance })
      return

    q_i ← 0                             # skip this item
    dfs(i + 1, remaining)

    for p_i in P_i:                     # pick a price × positive quantity
      for q_i in 1..floor(remaining / p_i):
        dfs(i + 1, remaining - p_i * q_i)

  dfs(1, T)

  # sort by the chosen strategy, take the first three with distinct prices:
  # mode = "bags"    → sort by (q_* asc, balance asc)   fewest bags first
  # mode = "balance" → sort by (balance asc, q_* asc)   balance items first
  sort candidates by mode
  picks ← first 3 with distinct prices, relax if fewer

  # verify: each set must satisfy Σ p_i * q_i + q_* = T
  return picks`
