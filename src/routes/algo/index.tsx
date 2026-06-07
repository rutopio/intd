import { createFileRoute } from "@tanstack/react-router"
import { Pseudocode } from "@/components/pseudocode"
import { Tex } from "@/components/tex"

export const Route = createFileRoute("/algo/")({ component: Algo })

function Formula({ children }: { children: string }) {
  return (
    <div className="my-4 overflow-x-auto rounded-md border bg-muted/40 px-4 py-3 text-center">
      <Tex block>{children}</Tex>
    </div>
  )
}

const PSEUDOCODE = `function decompose(T, items):       # items[1..n]，每項有合法價格集合 P_i
  candidates ← []

  function dfs(i, remaining):        # 決定第 i 項的價格與數量
    if i > n:                        # 所有品項已決定
      q_* ← remaining                # 剩餘金額交給塑膠袋
      if q_* < 0 or q_* > 4: return
      if sum(q_i) = 0: return        # 不能只有塑膠袋
      if q_* > sum(q_i): return      # 塑膠袋 ≤ 品項總數
      balance ← max(q_i) - min(q_i)  # 越小越平衡
      candidates.push({ p_i, q_i, q_*, balance })
      return

    q_i ← 0                          # 不選此項
    dfs(i + 1, remaining)

    for p_i in P_i:                  # 選某價格 × 正數量
      for q_i in 1..floor(remaining / p_i):
        dfs(i + 1, remaining - p_i * q_i)

  dfs(1, T)

  # 依平衡分數（其次塑膠袋數）排序，取前三個不同價格組合
  sort candidates by (balance asc, q_* asc)
  picks ← first 3 with distinct prices, relax if fewer

  # 驗算：每組必滿足 Σ p_i * q_i + q_* = T
  return picks`

{
  /* <main className="mx-auto flex w-full min-w-0 flex-auto flex-col p-6  sm:p-12"> */
}

function Algo() {
  return (
    <main className="mx-auto w-full p-6 sm:max-w-4xl sm:p-12">
      <article className="flex flex-col gap-6 text-sm leading-loose">
        <header className="flex flex-col gap-2">
          <h1 className="font-semibold text-2xl">演算法說明</h1>
          <p className="text-muted-foreground">
            當給定任意正整數總價，欲將其拆解成若干品項（便當、飲料……）
            與塑膠袋的合理組合。
          </p>
        </header>

        <section className="flex flex-col gap-3">
          <h2 className="font-medium text-lg">品項與價格規則</h2>
          <p>
            一般化來看，共有 <Tex>n</Tex> 個可設定的品項，第 <Tex>i</Tex>{" "}
            個品項（<Tex>{`i = 1, 2, \\dots, n`}</Tex>）有各自的合法價格集合{" "}
            <Tex>{`P_i`}</Tex>，從中選定價格 <Tex>{`p_i`}</Tex> 與數量{" "}
            <Tex>{`q_i`}</Tex>。例如：
          </p>
          <ul className="flex list-disc flex-col gap-1 pl-5">
            <li>
              便當（第 1 項，價格 <Tex>{`p_1`}</Tex>、數量 <Tex>{`q_1`}</Tex>
              ）：價格 <code>90 ~ 150</code>，且以 <code>0</code>、
              <code>5</code>、<code>9</code> 結尾，例如 99、120、135。
            </li>
            <li>
              飲料（第 2 項，價格 <Tex>{`p_2`}</Tex>、數量 <Tex>{`q_2`}</Tex>
              ）：價格 <code>40 ~ 90</code>，且以 <code>0</code>、<code>5</code>{" "}
              結尾，例如 45、60、85。
            </li>
            <li>
              同理可再加入第 3、4 項（<Tex>{`p_3, p_4, \\dots`}</Tex>），
              演算法不需更動即可推廣。
            </li>
            <li>
              塑膠袋（固定湊數項，價格 <Tex>{`p_* = 1`}</Tex>、數量{" "}
              <Tex>{`q_*`}</Tex>）：每個 <code>1</code> 元，數量 0 ~ 4
              （通常用於湊整找零）。此項固定存在，不在使用者可設定的{" "}
              <Tex>n</Tex> 個品項之內。
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-medium text-lg">問題定義</h2>
          <p>
            這是一個「受限整數拆解」（Constrained Integer
            Decomposition）問題。設目標總價為 <Tex>T</Tex>，對每個品項{" "}
            <Tex>i</Tex> 求一組價格 <Tex>{`p_i`}</Tex> 與數量 <Tex>{`q_i`}</Tex>
            ，另加塑膠袋數量 <Tex>{`q_*`}</Tex>
            （單價 <Tex>{`p_* = 1`}</Tex>），滿足：
          </p>
          <Formula>
            {String.raw`\sum_{i=1}^{n} p_i \cdot q_i + q_* = T`}
          </Formula>
          <p>
            以便當、飲料兩項（<Tex>{`n = 2`}</Tex>）為例，即為：
          </p>
          <Formula>
            {String.raw`p_1 \cdot q_1 + p_2 \cdot q_2 + q_* = T`}
          </Formula>
          <p>並在所有合法解中，使各品項的數量盡可能平衡：</p>
          <Formula>
            {String.raw`\min\; \bigl(\max_i q_i - \min_i q_i\bigr)`}
          </Formula>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-medium text-lg">約束條件</h2>
          <ol className="flex list-decimal flex-col gap-1 pl-5">
            <li>
              同一筆訂單中，每個品項 <Tex>i</Tex> 只用單一價格{" "}
              <Tex>{`p_i`}</Tex>。
            </li>
            <li>
              各品項數量 <Tex>{`q_i`}</Tex> 須盡量平衡，避免如 20 個便當配 4
              個飲料的失衡組合。
            </li>
            <li>
              塑膠袋為選配，可有可無（<Tex>{`q_* \\ge 0`}</Tex>）。
            </li>
            <li>
              各品項可選或不選（<Tex>{`q_i \\ge 0`}</Tex>），但至少要有一項
              數量為正，<strong>不能只有塑膠袋</strong>（
              <Tex>{String.raw`\sum_i q_i \ge 1`}</Tex>）。
            </li>
            <li>
              塑膠袋數量不超過所有品項的總數（
              <Tex>{String.raw`q_* \le \sum_i q_i`}</Tex>）。
            </li>
            <li>得到答案後再次驗算，確認總價等於給定值。</li>
          </ol>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-medium text-lg">求解策略</h2>
          <ol className="flex list-decimal flex-col gap-2 pl-5">
            <li>
              為每個品項 <Tex>i</Tex> 列出其合法價格集合 <Tex>{`P_i`}</Tex>。
            </li>
            <li>
              以深度優先（DFS）逐項決定：第 <Tex>i</Tex> 項可「不選」（
              <Tex>{`q_i = 0`}</Tex>）或挑某價格 <Tex>{`p_i`}</Tex> 搭配正數量{" "}
              <Tex>{`q_i`}</Tex>，並扣去 <Tex>{`p_i \\cdot q_i`}</Tex>。
            </li>
            <li>
              所有品項決定後，剩餘金額即為塑膠袋數量 <Tex>{`q_*`}</Tex>； 若落在{" "}
              <Tex>{`0 \\le q_* \\le 4`}</Tex> 且符合所有約束，
              記為一個候選解，並計算平衡分數{" "}
              <Tex>{String.raw`\max_i q_i - \min_i q_i`}</Tex>。
            </li>
            <li>
              將候選解依平衡分數（其次塑膠袋數）由小到大排序，取前三個不同價格
              組合的方案呈現。
            </li>
            <li>「換一批」會排除已出現過的方案，往後取下一批不同的組合。</li>
            <li>
              每個方案的總價在建構時即按公式計算，保證等於 <Tex>T</Tex>。
            </li>
          </ol>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-medium text-lg">虛擬碼</h2>
          <Pseudocode code={PSEUDOCODE} />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-medium text-lg">時間與空間複雜度</h2>
          <p>
            設目標總價為 <Tex>T</Tex>，品項數為 <Tex>n</Tex>，第 <Tex>i</Tex>{" "}
            項的合法價格集合 <Tex>{`P_i`}</Tex> 大小為 <Tex>{`|P_i|`}</Tex>
            ，塑膠袋數量 <Tex>{`q_*`}</Tex> 上限為 <Tex>4</Tex>
            。由於各品項價格範圍固定，
            <Tex>{`|P_i|`}</Tex>、<Tex>n</Tex> 與 <Tex>{`q_*`}</Tex>{" "}
            的上限皆為常數。
          </p>
          <p>
            DFS 為每項挑「價格 × 數量」，第 <Tex>i</Tex> 項的數量{" "}
            <Tex>{`q_i`}</Tex> 最多到 <Tex>{`T / p_i`}</Tex>（即{" "}
            <Tex>{`O(T)`}</Tex>），共 <Tex>n</Tex> 層。約束與驗算皆為{" "}
            <Tex>{`O(1)`}</Tex>，故列舉候選為：
          </p>
          <Formula>
            {String.raw`O\!\left(\prod_{i=1}^{n} |P_i| \cdot T\right) = O\!\left(T^{n}\right)`}
          </Formula>
          <p className="text-muted-foreground">
            注意 <Tex>{`O(T^{n})`}</Tex> 的
            <strong>
              底數是總價 <Tex>T</Tex>
            </strong>
            、
            <strong>
              指數是品項種類數 <Tex>n</Tex>
            </strong>
            （並非 <Tex>{`O(n^{T})`}</Tex> 或 <Tex>{`O(n^{10})`}</Tex>{" "}
            之類）。例如 10 種品項即 <Tex>{`O(T^{10})`}</Tex>，會隨 <Tex>T</Tex>{" "}
            急遽爆炸； 故 <Tex>n</Tex> 須為小常數（一般為
            2），固定後即為下方所述的多項式級數。
          </p>
          <p>
            候選解數量同樣為 <Tex>{`O(T^{n})`}</Tex>{" "}
            等級，挑選時依平衡分數排序，成本為{" "}
            <Tex>{String.raw`O(T^{n} \log T)`}</Tex>。整體：
          </p>
          <ul className="flex list-disc flex-col gap-1 pl-5">
            <li>
              時間複雜度：<Tex>{String.raw`O(T^{n} \log T)`}</Tex>（列舉{" "}
              <Tex>{`O(T^{n})`}</Tex>＋排序{" "}
              <Tex>{String.raw`O(T^{n} \log T)`}</Tex>）。
            </li>
            <li>
              空間複雜度：<Tex>{`O(T^{n})`}</Tex>（儲存候選解）。
            </li>
          </ul>
          <p className="text-muted-foreground">
            品項數 <Tex>n</Tex> 一般為小常數（便當＋飲料即 <Tex>{`n = 2`}</Tex>
            ），價格集合與袋數皆為常數因子，故對固定品項數，複雜度隨總價{" "}
            <Tex>T</Tex> 呈多項式成長，對一般金額皆可即時計算。
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-medium text-lg">與整數規劃方法的關係</h2>
          <p>
            本題在數學上屬「純整數規劃」（Integer Programming，IP）：所有變數{" "}
            <Tex>{`q_i, q_*`}</Tex> 皆為非負整數，且需滿足線性等式與不等式約束。
            一般 IP 的標準解法有兩類：
          </p>
          <ul className="flex list-disc flex-col gap-1 pl-5">
            <li>
              <strong>分支定界（Branch-and-Bound）</strong>：先解放鬆整數限制的
              線性規劃（LP relaxation），對某個解為非整數的數量{" "}
              <Tex>{`q_i`}</Tex>（其鬆弛解 <Tex>{`q_i^*`}</Tex>） 分支成{" "}
              <Tex>{String.raw`q_i \le \lfloor q_i^* \rfloor`}</Tex> 與{" "}
              <Tex>{String.raw`q_i \ge \lceil q_i^* \rceil`}</Tex>
              ，再以上下界剪去不可能更優的子問題。
            </li>
            <li>
              <strong>割平面（Cutting-plane / Gomory）</strong>：在 LP
              relaxation 的最優解上，加入一條能切掉該分數解、卻保留所有整數解的
              不等式，反覆重解直到全為整數。
            </li>
          </ul>
          <p>
            本實作<strong>刻意不採用</strong>這兩種方法，而用全枚舉 （exhaustive
            search），原因有三：
          </p>
          <ol className="flex list-decimal flex-col gap-1 pl-5">
            <li>
              <strong>規模極小</strong>：<Tex>n</Tex> 通常為 2、價格集合與塑膠袋
              上限皆為固定常數，全枚舉已是毫秒級，無效能瓶頸。
            </li>
            <li>
              <strong>需求是多解而非單一最優</strong>：本應用要列出前三個平衡且
              多樣的組合，並支援「換一批」排除已出現解；分支定界一旦剪枝即丟棄
              次優解，反而難以列舉。
            </li>
            <li>
              <strong>簡單性</strong>：分支定界與割平面需引入線性規劃求解器
              （如單純形法）與分支樹，依賴與複雜度大增，對即時小工具屬過度設計。
            </li>
          </ol>
          <p className="text-muted-foreground">
            若未來品項數 <Tex>n</Tex> 顯著增大或 <Tex>T</Tex> 極大，可先在 DFS
            中加入分支定界的「界限剪枝」（以目前最佳平衡分數提前中止劣於它的分支），
            即可在不引入求解器的前提下沿用同一骨架加速。
          </p>
        </section>
      </article>
    </main>
  )
}
