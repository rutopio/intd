// Pseudocode body for algo.mdx, kept in a .ts file so markdown/MDX editor
// formatters never rewrite the underscores, asterisks, or indentation inside it.
export const algoPseudocode = `function decompose(T, items):          # items[1..n]，每項有合法價格集合 P_i
  candidates ← []

  function dfs(i, remaining):           # 決定第 i 項的價格與數量
    if i > n:                           # 所有品項已決定
      q_* ← remaining                   # 剩餘金額交給塑膠袋
      if q_* < 0 or q_* > 9: return
      if sum(q_i) = 0: return           # 不能只有塑膠袋
      if q_* > sum(q_i): return         # 塑膠袋 ≤ 品項總數
      balance ← max(q_i) - min(q_i)     # 越小越平衡
      candidates.push({ p_i, q_i, q_*, balance })
      return

    q_i ← 0                             # 不選此項
    dfs(i + 1, remaining)

    for p_i in P_i:                     # 選某價格 × 正數量
      for q_i in 1..floor(remaining / p_i):
        dfs(i + 1, remaining - p_i * q_i)

  dfs(1, T)

  # 依所選策略排序，取前三個不同價格組合：
  # mode = "bags"    → sort by (q_* asc, balance asc)   塑膠袋最少優先
  # mode = "balance" → sort by (balance asc, q_* asc)   數量平衡優先
  sort candidates by mode
  picks ← first 3 with distinct prices, relax if fewer

  # 驗算：每組必滿足 Σ p_i * q_i + q_* = T
  return picks`
