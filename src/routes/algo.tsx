import { createFileRoute } from "@tanstack/react-router"
import { Tex } from "@/components/tex"

export const Route = createFileRoute("/algo")({ component: Algo })

function Formula({ children }: { children: string }) {
  return (
    <div className="my-4 overflow-x-auto rounded-md border bg-muted/40 px-4 py-3 text-center">
      <Tex block>{children}</Tex>
    </div>
  )
}

const PSEUDOCODE = `function decompose(T):
  BENTO ← prices in 90..150 ending with 0, 5, 9
  DRINK ← prices in 40..90 ending with 0, 5
  candidates ← []

  for pb in BENTO:
    for pd in DRINK:
      for b in 0..floor(T / pb):          # 便當數量
        rest ← T - pb * b
        for g in 0..4:                    # 塑膠袋數量
          left ← rest - g
          if left < 0: break
          if left mod pd ≠ 0: continue    # 剩餘須整除飲料價
          d ← left / pd                    # 飲料數量
          if b = 0 and d = 0: continue    # 不能只有塑膠袋
          if g > b + d: continue          # 塑膠袋 ≤ 便當 + 飲料
          balance ← |b - d|               # 越小越平衡
          candidates.push({pb, b, pd, d, g, balance})

  # 依平衡分數（其次塑膠袋數）排序，取前三個不同價格組合
  sort candidates by (balance asc, g asc)
  picks ← first 3 with distinct (pb, pd), relax if fewer

  # 驗算：每組必滿足 pb*b + pd*d + g = T
  return picks`

function Pseudocode() {
  return (
    <pre className="overflow-x-auto rounded-md border bg-muted/40 p-4 font-mono text-xs leading-relaxed">
      <code>{PSEUDOCODE}</code>
    </pre>
  )
}

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
            給定任意正整數總價，拆解成便當、飲料、塑膠袋的合理組合。
          </p>
        </header>

        <section className="flex flex-col gap-3">
          <h2 className="font-medium text-lg">品項與價格規則</h2>
          <ul className="flex list-disc flex-col gap-1 pl-5">
            <li>
              便當：價格 <code>90 ~ 150</code>，且以 <code>0</code>、
              <code>5</code>、<code>9</code> 結尾，例如 99、120、 135。
            </li>
            <li>
              飲料：價格 <code>40 ~ 90</code>，且以 <code>0</code>、
              <code>5</code> 結尾，例如 45、60、85。
            </li>
            <li>
              塑膠袋：每個 <code>1</code> 元，數量 0 ~ 4（通常用於湊整找零）。
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-medium text-lg">問題定義</h2>
          <p>
            這是一個受限整數拆解（Constrained Integer
            Decomposition）問題。設目標總價為 <Tex>T</Tex>，求一組便當價格{" "}
            <Tex>{`p_b`}</Tex>、飲料價格 <Tex>{`p_d`}</Tex>
            、便當數量 <Tex>b</Tex>、飲料數量 <Tex>d</Tex>、塑膠袋數量{" "}
            <Tex>g</Tex>，滿足：
          </p>
          <Formula>{String.raw`p_b \cdot b + p_d \cdot d + g = T`}</Formula>
          <p>並在所有合法解中，使便當與飲料的數量盡可能平衡：</p>
          <Formula>{String.raw`\min\; \lvert b - d \rvert`}</Formula>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-medium text-lg">約束條件</h2>
          <ol className="flex list-decimal flex-col gap-1 pl-5">
            <li>同一筆訂單中，便當只用單一價格、飲料只用單一價格。</li>
            <li>
              便當與飲料數量須盡量平衡，避免如 20 個便當配 4 個飲料的失衡組合。
            </li>
            <li>塑膠袋為選配，可有可無。</li>
            <li>
              可以「只有便當」「只有飲料」「便當＋飲料」「便當＋塑膠袋」「全部都有」
              等組合，但<strong>不能只有塑膠袋</strong>。
            </li>
            <li>
              塑膠袋數量不超過便當與飲料的總數（
              <Tex>{String.raw`g \le b + d`}</Tex>）。
            </li>
            <li>得到答案後再次驗算，確認總價等於給定值。</li>
          </ol>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-medium text-lg">求解策略</h2>
          <ol className="flex list-decimal flex-col gap-2 pl-5">
            <li>列出所有合法便當價格與飲料價格。</li>
            <li>
              枚舉每組 <Tex>{`(p_b, p_d)`}</Tex> 與便當數量 <Tex>b</Tex>
              、塑膠袋數量 <Tex>g</Tex>，將剩餘金額{" "}
              <Tex>{String.raw`T - p_b \cdot b - g`}</Tex> 嘗試整除飲料價格得到{" "}
              <Tex>d</Tex>。
            </li>
            <li>
              整除成功且符合所有約束的，記為一個候選解，並計算平衡分數{" "}
              <Tex>{String.raw`\lvert b - d \rvert`}</Tex>。
            </li>
            <li>
              將候選解依平衡分數（其次塑膠袋數）由小到大排序，取前三個不同價格
              組合的方案呈現。
            </li>
            <li>「換一批」會排除已出現過的方案，往後取下一批不同的組合。</li>
            <li>每個方案的總價在建構時即按公式計算，保證等於 T。</li>
          </ol>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-medium text-lg">虛擬碼</h2>
          <Pseudocode />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-medium text-lg">時間與空間複雜度</h2>
          <p>
            設目標總價為 <Tex>T</Tex>，合法便當價格數為 <Tex>{`P_b`}</Tex>
            、飲料價格數為 <Tex>{`P_d`}</Tex>、塑膠袋上限為 <Tex>{`G = 4`}</Tex>
            。由於價格集合範圍固定，
            <Tex>{`P_b`}</Tex>、<Tex>{`P_d`}</Tex>、<Tex>G</Tex> 皆為常數。
          </p>
          <p>
            枚舉時，外層走遍每組 <Tex>{`(p_b, p_d)`}</Tex>，便當數量{" "}
            <Tex>b</Tex> 最多到 <Tex>{`T / p_b`}</Tex>（即 <Tex>{`O(T)`}</Tex>
            ），塑膠袋再乘上常數 <Tex>{`G + 1`}</Tex>
            。整除與約束檢查皆為 <Tex>{`O(1)`}</Tex>，故列舉候選為：
          </p>
          <Formula>
            {String.raw`O\bigl(P_b \cdot P_d \cdot (G + 1) \cdot T\bigr) = O(T)`}
          </Formula>
          <p>
            候選解數量同樣為 <Tex>{`O(T)`}</Tex>{" "}
            等級，挑選時依平衡分數排序，成本為{" "}
            <Tex>{String.raw`O(T \log T)`}</Tex>。整體：
          </p>
          <ul className="flex list-disc flex-col gap-1 pl-5">
            <li>
              時間複雜度：<Tex>{String.raw`O(T \log T)`}</Tex>（列舉{" "}
              <Tex>{`O(T)`}</Tex>＋排序 <Tex>{String.raw`O(T \log T)`}</Tex>）。
            </li>
            <li>
              空間複雜度：<Tex>{`O(T)`}</Tex>（儲存候選解）。
            </li>
          </ul>
          <p className="text-muted-foreground">
            因價格與袋數皆為常數因子，複雜度只隨總價 <Tex>T</Tex> 線性
            （含排序則為線性對數）成長，對一般金額皆可即時計算。
          </p>
        </section>
      </article>
    </main>
  )
}
