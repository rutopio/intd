import { createFileRoute } from "@tanstack/react-router"
import {
  A,
  Article,
  CodeBlock,
  Formula,
  H1,
  H2,
  H3,
  Li,
  M,
  Muted,
  Ol,
  P,
  Section,
  Ul,
} from "@/components/prose"
import { Pseudocode } from "@/components/pseudocode"

export const Route = createFileRoute("/algo/")({ component: Algo })

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

  # 依所選策略排序，取前三個不同價格組合：
  #   mode = "bags"    → sort by (q_* asc, balance asc)   塑膠袋最少優先
  #   mode = "balance" → sort by (balance asc, q_* asc)   數量平衡優先
  sort candidates by mode
  picks ← first 3 with distinct prices, relax if fewer

  # 驗算：每組必滿足 Σ p_i * q_i + q_* = T
  return picks`

function Algo() {
  return (
    <main className="mx-auto w-full p-6 sm:max-w-4xl sm:p-12">
      <Article>
        <header className="flex flex-col gap-2">
          <H1>{"演算法說明"}</H1>
          <P>
            {
              "這是一個「在限制條件下的整數拆解」（Constrained Integer Decomposition）問題：當給定任意正整數總價，欲將其拆解成若干品項（例如便當、飲料等）與一元品項（例如塑膠袋）的合理組合，並滿足以下約束條件："
            }
          </P>
          <Ul>
            <Li>{"同一筆訂單中，每個品項只用單一價格。"}</Li>
            <Li>{"一元品項為選配，可有可無。"}</Li>
          </Ul>
        </header>

        <Section>
          <H2>{"品項與價格規則"}</H2>
          <P>
            {"假設共有 "}
            <M>n</M>
            {" 個可湊數的品項，第 "}
            <M>i</M>
            {" 個品項（"}
            <M>{`i = 1, 2, \\dots, n`}</M>
            {"）有各自的合理價格集合 "}
            <M>{String.raw`P_i \subseteq \mathbb{Z}^+`}</M>
            {
              "（所有價格皆為正整數）。從此價格集合中，選定滿足特定尾數條件的價格 "
            }
            <M>{`p_i \\in P_i`}</M>
            {"、與數量 "}
            <M>{String.raw`q_i \in \mathbb{N}_0`}</M>
            {"（每個項目皆為可選或不選）。例如："}
          </P>
          <Ul>
            <Li>
              {"便當（第 1 項，"}
              <M>{`i = 1`}</M>
              {"，價格 "}
              <M>{`p_1`}</M>
              {"，數量 "}
              <M>{`q_1`}</M>
              {"）：價格範圍 "}
              <M>{`P_1`}</M>
              {" 在 "}
              <code>90~150</code>
              {" 元之間，且價格 "}
              <M>{`p_1`}</M>
              {" 以 "}
              <code>0</code>
              {"、"}
              <code>5</code>
              {"、"}
              <code>9</code>
              {" 結尾，例如 "}
              <code>99</code>
              {"、"}
              <code>120</code>
              {"、"}
              <code>135</code>
              {" 元。"}
            </Li>
            <Li>
              {"飲料（第 2 項，"}
              <M>{`i = 2`}</M>
              {"，價格 "}
              <M>{`p_2`}</M>
              {"，數量 "}
              <M>{`q_2`}</M>
              {"）：價格範圍 "}
              <M>{`P_2`}</M>
              {" 在 "}
              <code>40~90</code>
              {" 元之間，且價格 "}
              <M>{`p_2`}</M>
              {" 以 "}
              <code>0</code>
              {"、"}
              <code>5</code>
              {" 結尾，例如 "}
              <code>45</code>
              {"、"}
              <code>60</code>
              {"、"}
              <code>85</code>
              {" 元。"}
            </Li>
          </Ul>
          <P>{"等同於："}</P>
          <Formula>
            {String.raw`\begin{aligned}
P_1 &= \{\, p \in \mathbb{Z}^+ : 90 \le p \le 150,\; p \bmod 10 \in \{0,5,9\} \,\} \\
P_2 &= \{\, p \in \mathbb{Z}^+ : 40 \le p \le 90,\; p \bmod 10 \in \{0,5\} \,\}
\end{aligned}`}
          </Formula>
          <Ul>
            <Li>
              {"同理可再拓展至第 3、4 項（"}
              <M>{`p_3, p_4, \\dots`}</M>
              {"）等。"}
            </Li>
            <Li>
              {"塑膠袋（一元品項，價格 "}
              <M>{`p_* = 1`}</M>
              {"、數量 "}
              <M>{`q_*`}</M>
              {"）：每個 "}
              <code>1</code>
              {" 元，數量 "}
              <code>0</code>
              {" ~ "}
              <code>4</code>
              {"（預期用於湊整找零）。"}
            </Li>
            <Li>
              {
                "包含一元品項在內，自定義品項合計至多 7 項（事實上可以拓展至無限多項，只是過多的品項對於此受限的拆解問題來說沒有意義）。"
              }
            </Li>
          </Ul>
        </Section>

        <Section>
          <H2>{"問題定義"}</H2>
          <P>
            {"設目標總價為 "}
            <M>{String.raw`T \in \mathbb{Z}^+`}</M>
            {"，對每個品項 "}
            <M>{String.raw`i \in \{1, 2, \dots, n\}`}</M>
            {" 求一組價格 "}
            <M>{`p_i`}</M>
            {" 與數量 "}
            <M>{`q_i`}</M>
            {"，另加塑膠袋數量 "}
            <M>{`q_*`}</M>
            {"（單價 "}
            <M>{`p_* = 1`}</M>
            {"），必須滿足以下等式："}
          </P>
          <Formula>
            {String.raw`\sum_{i=1}^{n} \big(p_i \cdot q_i\big) + q_* = T`}
          </Formula>
          <P>
            {"以便當、飲料兩項（"}
            <M>{`n = 2`}</M>
            {"）為例，即為："}
          </P>
          <Formula>
            {String.raw`\big(p_1 \cdot q_1\big) + \big(p_2 \cdot q_2\big) + q_* = T`}
          </Formula>
          <P>
            {"設 "}
            <M>{String.raw`\mathcal{F}`}</M>
            {" 為所有滿足前述等式與約束的合法解集合（feasible set），並在 "}
            <M>{String.raw`\mathcal{F}`}</M>
            {" 中依使用者選擇的策略排序取優："}
          </P>
          <Ul>
            <Li>
              <strong>{"塑膠袋最少"}</strong>
              {
                "：基於「便當店的塑膠袋不用額外付費」假設，優先使塑膠袋這個湊數項盡可能少，其次才使個品相間的數量盡量平衡。"
              }
            </Li>
          </Ul>
          <Formula>
            {String.raw`\operatorname*{arg\,min}_{\mathcal{F}}\; q_*`}
          </Formula>
          <Ul>
            <Li>
              <strong>{"各品項間的數量平衡"}</strong>
              {
                "：基於「買便當的人也會買飲料」假設，優先使各品項數量盡量平衡，其次才使塑膠袋數量盡可能少。"
              }
            </Li>
          </Ul>
          <Formula>
            {String.raw`\operatorname*{arg\,min}_{\mathcal{F}}\bigl(\max_i q_i - \min_i q_i\bigr)`}
          </Formula>
        </Section>

        <Section>
          <H2>{"約束條件"}</H2>
          <Ol>
            <Li>
              {"同一筆訂單中，每個品項 "}
              <M>i</M>
              {" 只用單一價格 "}
              <M>{`p_i`}</M>
              {"。"}
            </Li>
            <Li>
              {
                "依使用者所選策略決定主要偏好：「塑膠袋最少」優先壓低塑膠袋數量 "
              }
              <M>{`q_*`}</M>
              {"，「各品項間的數量平衡」優先讓各品項數量 "}
              <M>{`q_i`}</M>
              {" 盡量平衡（避免像是出現 "}
              <code>20</code>
              {" 個便當配 "}
              <code>4</code>
              {" 個飲料的組合）。"}
            </Li>
            <Li>
              {"塑膠袋為選配，可有可無（"}
              <M>{`q_* \\ge 0`}</M>
              {"）。"}
            </Li>
            <Li>
              {"各品項可選或不選（"}
              <M>{`q_i \\ge 0`}</M>
              {"），但至少要有一項數量為正。顯然，合理的解不應該只有塑膠袋（"}
              <M>{String.raw`\sum_i q_i \ge 1`}</M>
              {"）。"}
            </Li>
            <Li>
              {"顯然，合理的解中，塑膠袋數量不超過所有品項的總數（"}
              <M>{String.raw`q_* \le \sum_i q_i`}</M>
              {"），畢竟通常不會有買 "}
              <code>10</code>
              {" 個便當、卻額外買 "}
              <code>30</code>
              {" 個塑膠袋的情況。"}
            </Li>
            <Li>
              {"得到組合解後再次驗算，確保總價等於 "}
              <M>T</M>
              {"。"}
            </Li>
          </Ol>
        </Section>

        <Section>
          <H2>{"為何需要一元品項？"}</H2>
          <P>
            {"目標總價 "}
            <M>T</M>
            {" 可以是任意正整數，但每個品項的價格 "}
            <M>{`p_i`}</M>
            {" 都受尾數限制（例如便當以 "}
            <code>0</code>
            {"、"}
            <code>5</code>
            {"、"}
            <code>9</code>
            {" 結尾，飲料以 "}
            <code>0</code>
            {"、"}
            <code>5</code>
            {" 結尾）。這代表只用這些品項所能湊出的金額 "}
            <M>{String.raw`\sum_i p_i q_i`}</M>
            {" 是離散且稀疏的，並非每個整數都湊得出來。"}
          </P>
          <P>
            {"若沒有一元品項，求解就退化成「在受限價格下恰好湊出 "}
            <M>T</M>
            {" 」的純整數問題。由於可湊金額之間存在間隙，對許多 "}
            <M>T</M>
            {" 根本不存在任何合法組合，會直接無解。舉例來說，若便當固定 "}
            <code>100</code>
            {" 元、飲料固定 "}
            <code>50</code>
            {" 元，則所有組合金額都是 "}
            <code>50</code>
            {" 的倍數，像 "}
            <code>123</code>
            {" 這種總價永遠湊不出來。"}
          </P>
          <P>
            {"一元品項（塑膠袋，單價 "}
            <M>{`p_* = 1`}</M>
            {"）提供 1 元單位的微調：先用品項逼近 "}
            <M>T</M>
            {"，再用塑膠袋補足剩餘的零頭。只要差額落在允許的塑膠袋數量範圍（"}
            <code>0</code>
            {" ~ "}
            <code>4</code>
            {"）內，原本無解的金額就變得可解，大幅提高有解的機會。"}
          </P>
        </Section>

        <Section>
          <H2>{"求解策略"}</H2>
          <P>
            {
              "整體思路可以濃縮成三句話：窮舉所有可能的買法、篩掉不合理的、再依偏好排序挑出最好的幾組。因為品項種類少、價格選擇也有限，直接把所有組合都試一遍即可，不需要任何進階的最佳化技巧。下面先說明枚舉的方式，再用一個例子實際走一遍。"
            }
          </P>

          <H3>{"如何枚舉所有買法"}</H3>
          <P>
            {
              "想像一個多層的決策過程：第一層決定「便當要不要買、買哪個價格、買幾個」，第二層決定飲料，以此類推，每一種品項佔一層。把每一層的所有選擇展開，就會像一棵不斷分岔的樹，樹上每一條從頂到底的路徑，就對應一種完整的買法。"
            }
          </P>
          <P>
            {"以 "}
            <M>{`T = 253`}</M>
            {"、便當 "}
            <code>100</code>
            {" 元、飲料 "}
            <code>75</code>
            {" 元為例，這棵樹大致長這樣（"}
            <code>✓</code>
            {" 為通過約束的候選解，"}
            <code>✗</code>
            {" 為塑膠袋超過 "}
            <code>4</code>
            {" 個而淘汰）："}
          </P>
          <CodeBlock>
            {`T = 253
├─ 便當 ×0 ┬ 飲料 ×0 → 剩 253 → 袋 253  ✗
│          ├ 飲料 ×1 → 剩 178 → 袋 178  ✗
│          └ 飲料 ×3 → 剩  28 → 袋  28  ✗
├─ 便當 ×1 ┬ 飲料 ×1 → 剩  78 → 袋  78  ✗
│          └ 飲料 ×2 → 剩   3 → 袋   3  ✓
└─ 便當 ×2 ┬ 飲料 ×0 → 剩  53 → 袋  53  ✗
           └ ...                       （略）`}
          </CodeBlock>
          <P>
            {"我們用"}
            <strong>{"深度優先搜尋（DFS）"}</strong>
            {
              "來走這棵樹：先沿著一條路徑一路走到底（所有品項都決定好），記錄結果，再回頭換下一個選擇，直到所有路徑都走過。對第 "
            }
            <M>i</M>
            {" 項，每一層的選擇有兩類："}
          </P>
          <Ul>
            <Li>
              {"「不選」這項（"}
              <M>{`q_i = 0`}</M>
              {"）；"}
            </Li>
            <Li>
              {"從合法價格集合 "}
              <M>{`P_i`}</M>
              {" 中挑一個價格 "}
              <M>{`p_i`}</M>
              {"，再決定買的數量 "}
              <M>{`q_i`}</M>
              {"（至少 "}
              <code>1</code>
              {" 個，且 "}
              <M>{`p_i \\cdot q_i`}</M>
              {" 不能超過目前剩下的金額）。"}
            </Li>
          </Ul>
          <P>
            {"每做一個選擇，就從剩餘金額扣掉 "}
            <M>{`p_i \\cdot q_i`}</M>
            {
              "，再進到下一層。所有品項都決定完後，還剩下的金額就直接交給塑膠袋，也就是 "
            }
            <M>{`q_*`}</M>
            {
              "。換句話說，塑膠袋不需要枚舉，它總是被動地把零頭補滿，確保總價剛好等於 "
            }
            <M>T</M>
            {"。"}
          </P>
          <P>
            {"走到底之後，這條路徑要成為一個「候選解」，必須通過前述"}
            <strong>{"約束條件"}</strong>
            {"的檢查：塑膠袋數量落在 "}
            <M>{`0 \\le q_* \\le 4`}</M>
            {
              "、至少買了一項品項、塑膠袋不超過品項總數等。通過的才留下，並記錄它的"
            }
            <strong>{"平衡分數"}</strong>{" "}
            <M>{String.raw`\max_i q_i - \min_i q_i`}</M>
            {"（各品項數量的最大值與最小值之差，越小代表各品項買得越平均）。"}
          </P>

          <H3>{"舉例走一遍"}</H3>
          <P>
            {"假設目標總價 "}
            <M>{`T = 253`}</M>
            {"，便當挑了 "}
            <code>100</code>
            {" 元、飲料挑了 "}
            <code>75</code>
            {" 元。DFS 會試遍便當、飲料的各種數量，例如："}
          </P>
          <Ul>
            <Li>
              {"買 "}
              <code>2</code>
              {" 個便當、"}
              <code>0</code>
              {" 杯飲料："}
              <M>{String.raw`100 \times 2 = 200`}</M>
              {"，剩 "}
              <code>53</code>
              {" 元 → 塑膠袋要 "}
              <code>53</code>
              {" 個，超過上限 "}
              <code>4</code>
              {"，淘汰。"}
            </Li>
            <Li>
              {"買 "}
              <code>1</code>
              {" 個便當、"}
              <code>1</code>
              {" 杯飲料："}
              <M>{String.raw`100 + 75 = 175`}</M>
              {"，剩 "}
              <code>78</code>
              {" 元 → 塑膠袋要 "}
              <code>78</code>
              {" 個，淘汰。"}
            </Li>
            <Li>
              {"買 "}
              <code>1</code>
              {" 個便當、"}
              <code>2</code>
              {" 杯飲料："}
              <M>{String.raw`100 + 75 \times 2 = 250`}</M>
              {"，剩 "}
              <code>3</code>
              {" 元 → 塑膠袋拿 "}
              <code>3</code>
              {" 個，恰好補滿，"}
              <strong>{"通過"}</strong>
              {"，成為候選解（平衡分數 "}
              <M>{String.raw`|1 - 2| = 1`}</M>
              {"）。"}
            </Li>
          </Ul>
          <P>{"最後一組代回原本的等式，確實成立："}</P>
          <Formula>
            {String.raw`\underbrace{100 \cdot 1}_{\text{便當}} + \underbrace{75 \cdot 2}_{\text{飲料}} + \underbrace{3}_{q_*} = 253`}
          </Formula>
          <P>
            {"可以看到，雖然 "}
            <code>253</code>
            {" 沒辦法只用便當、飲料湊出來，但靠塑膠袋補上 "}
            <code>3</code>
            {
              " 元的零頭就成立了。DFS 會把便當、飲料的所有價格與數量組合都這樣試一遍，蒐集到全部的候選解。"
            }
          </P>

          <H3>{"排序與呈現"}</H3>
          <P>
            {
              "蒐集到所有候選解後，依使用者選擇的策略排序（「塑膠袋最少」或「各品項間的數量平衡」，其中一項為主要鍵、另一項為平手時的次要鍵），由小到大取前三個"
            }
            <strong>{"價格組合彼此不同"}</strong>
            {
              "的方案呈現。按下「新組合」按鈕，則會排除已出現過的方案，往後取下一批不同的組合。"
            }
          </P>
          <P>
            {
              "由於每個方案的塑膠袋數量都是用「剩餘金額」反推、且建構時即按公式計算，總價必然等於 "
            }
            <M>T</M>
            {"；不過為求保險，輸出前仍會再驗算一次。下面是對應的虛擬碼。"}
          </P>
        </Section>

        <Section>
          <H2>{"Pseudocode"}</H2>
          <Pseudocode code={PSEUDOCODE} />
        </Section>

        <Section>
          <H2>{"時間與空間複雜度"}</H2>
          <P>
            {"以"}
            <strong>
              {"品項種類數 "}
              <M>n</M>
            </strong>
            {" 為主變數來看本演算法的成長階數：DFS 共 "}
            <M>n</M>
            {" 層，每多一種品項就多巢狀一層列舉，因此 "}
            <M>n</M>
            {" 出現在"}
            <strong>{"指數"}</strong>
            {"位置，是決定複雜度量級的主因。"}
          </P>
          <P>
            {"設目標總價為 "}
            <M>T</M>
            {"，第 "}
            <M>i</M>
            {" 項的合法價格集合 "}
            <M>{`P_i`}</M>
            {" 大小為 "}
            <M>{`|P_i|`}</M>
            {"，塑膠袋數量 "}
            <M>{`q_*`}</M>
            {" 上限為 "}
            <code>4</code>
            {"。每一層 DFS 為該項挑「價格 × 數量」，數量 "}
            <M>{`q_i`}</M>
            {" 最多到 "}
            <M>{`T / p_i`}</M>
            {"（即 "}
            <M>{`O(T)`}</M>
            {"）；約束與驗算皆為 "}
            <M>{`O(1)`}</M>
            {"。將 "}
            <M>n</M>
            {" 層相乘，列舉候選為："}
          </P>
          <Formula>
            {String.raw`O\!\left(\prod_{i=1}^{n} |P_i| \cdot T\right) = O\!\left(T^{n}\right)`}
          </Formula>
          <Muted>
            {"主變數 "}
            <M>n</M>
            {" 在"}
            <strong>{"指數"}</strong>
            {"位置、總價 "}
            <M>T</M>
            {" 在"}
            <strong>{"底數"}</strong>
            {"位置（並非 "}
            <M>{`O(n^{T})`}</M>
            {" 或 "}
            <M>{`O(n^{10})`}</M>
            {" 之類）："}
            <M>n</M>
            {" 每增加一就讓階數整整高一階，例如 10 種品項即 "}
            <M>{`O(T^{10})`}</M>
            {"，故 "}
            <M>n</M>
            {" 必須是小常數（一般為 2）。另須注意 "}
            <M>T</M>
            {" 是「數值大小」而非資料筆數，以其輸入位元數衡量時本演算法屬"}
            <strong>{"偽多項式"}</strong>
            {"（pseudo-polynomial），與背包問題的 "}
            <M>{`O(nW)`}</M>
            {" 同類。"}
          </Muted>
          <P>
            {
              "要注意「走訪過的節點數」與「真正成為候選解的數量」並不同。被走訪的節點是 "
            }
            <M>{`O(T^{n})`}</M>
            {"，但候選解還必須通過「剩餘金額落在 "}
            <M>{`0 \\le q_* \\le 4`}</M>
            {"」這個約束，等於把解空間限制在 "}
            <M>{String.raw`\sum_i p_i q_i \in [T-4,\, T]`}</M>
            {" 的一層薄片上：前 "}
            <M>{`n - 1`}</M>
            {" 項可自由選（"}
            <M>{`O(T^{n-1})`}</M>
            {" 種），最後一項與塑膠袋為了湊進這層薄片幾乎被前面決定，只剩 "}
            <M>{`O(1)`}</M>
            {" 的自由度。因此候選解數量是 "}
            <M>{`O(T^{n-1})`}</M>
            {"，比走訪節點數少一階。"}
          </P>
          <P>
            {"挑選時依所選策略對候選解排序，成本為 "}
            <M>{String.raw`O(T^{n-1} \log T)`}</M>
            {"；這比列舉的 "}
            <M>{`O(T^{n})`}</M>
            {" 低一階，並非瓶頸。整體："}
          </P>
          <Ul>
            <Li>
              {"時間複雜度："}
              <M>{`O(T^{n})`}</M>
              {"（由列舉主導，排序 "}
              <M>{String.raw`O(T^{n-1} \log T)`}</M>
              {" 被其蓋過）。"}
            </Li>
            <Li>
              {"空間複雜度："}
              <M>{`O(T^{n-1})`}</M>
              {"（儲存候選解；遞迴堆疊深度僅 "}
              <M>{`O(n)`}</M>
              {"，可忽略）。"}
            </Li>
          </Ul>
          <Muted>
            {"品項數 "}
            <M>n</M>
            {" 一般為小常數（便當＋飲料即 "}
            <M>{`n = 2`}</M>
            {"），價格集合與袋數皆為常數因子，故對固定品項數，複雜度隨總價 "}
            <M>T</M>
            {" 呈多項式成長，對一般金額皆可即時計算。"}
          </Muted>
        </Section>

        <Section>
          <H2>{"與整數規劃方法的關係"}</H2>
          <P>
            {
              "更貼切地說，這個問題屬於「有界硬幣找零」（bounded change-making）這一族：把目標金額 "
            }
            <M>T</M>
            {
              " 用若干種有面額限制、且數量有上界的「硬幣」（這裡是品項與塑膠袋）湊出來。它與子集合加總（subset-sum）、背包（knapsack）、Frobenius（硬幣）問題同源，屬"
            }
            <strong>{"弱 NP-hard"}</strong>
            {
              "。在數學上它也可寫成一個「純整數規劃」（Integer Programming，IP）：所有變數 "
            }
            <M>{`q_i, q_*`}</M>
            {
              " 皆為非負整數，且需滿足線性等式與不等式約束。一般來說，整數規劃的標準解法有兩個方向："
            }
          </P>
          <Ul>
            <Li>
              <strong>{"分支定界（Branch-and-Bound）"}</strong>
              {
                "：先解放鬆整數限制的線性規劃（LP relaxation），對某個解為非整數的數量 "
              }
              <M>{`q_i`}</M>
              {"（其鬆弛解 "}
              <M>{`q_i^*`}</M>
              {"）分支成 "}
              <M>{String.raw`q_i \le \lfloor q_i^* \rfloor`}</M>
              {" 與 "}
              <M>{String.raw`q_i \ge \lceil q_i^* \rceil`}</M>
              {"，再以上下界剪去不可能更優的子問題。"}
            </Li>
            <Li>
              <strong>{"割平面（Cutting-plane / Gomory）"}</strong>
              {
                "：在 LP relaxation 的最優解上，加入一條能切掉該分數解、卻保留所有整數解的不等式，反覆重解直到全為整數。"
              }
            </Li>
          </Ul>
          <P>
            {"本實作"}
            <strong>{"刻意不採用"}</strong>
            {"這兩種方法，而用全枚舉（exhaustive search），原因有三："}
          </P>
          <Ol>
            <Li>
              <strong>{"規模極小"}</strong>
              {"："}
              <M>n</M>
              {
                " 通常為 2、價格集合與塑膠袋上限皆為固定常數，全枚舉已是毫秒級，無效能瓶頸。"
              }
            </Li>
            <Li>
              <strong>{"需求是多解而非單一最優"}</strong>
              {
                "：本應用要列出前三個平衡且多樣的組合，並支援「換一批」排除已出現解；分支定界一旦剪枝即丟棄次優解，反而難以列舉。"
              }
            </Li>
            <Li>
              <strong>{"簡單性"}</strong>
              {
                "：分支定界與割平面需引入線性規劃求解器（如單純形法）與分支樹，依賴與複雜度大增，對即時小工具屬過度設計。"
              }
            </Li>
          </Ol>
          <P>
            {"值得一提的是，若問題只是「能否湊出 "}
            <M>T</M>
            {"」或「共有幾種湊法」，用"}
            <strong>{"動態規劃"}</strong>
            {"（dynamic programming）可在 "}
            <M>{`O(nT)`}</M>
            {" 時間內解決，漸進複雜度優於本實作的 "}
            <M>{`O(T^{n})`}</M>
            {
              "。但本應用的需求並非判定或計數，而是要「逐一列出具體的多組解、附上平衡分數、並支援換一批」；要從 DP 表回溯出所有符合多目標排序的組合反而更繁瑣，且在 "
            }
            <M>{`n = 2`}</M>
            {
              " 時兩者實際耗時都是毫秒級。因此本實作並非漸進複雜度最優，但在此規模下是兼顧正確與簡單的最合適選擇。"
            }
          </P>
          <Muted>
            {"若未來品項數 "}
            <M>n</M>
            {" 顯著增大或 "}
            <M>T</M>
            {
              " 極大，可先在 DFS 中加入分支定界的「界限剪枝」（以目前最佳主要鍵提前中止劣於它的分支），即可在不引入求解器的前提下沿用同一骨架加速。"
            }
          </Muted>
        </Section>

        <Section>
          <H2>{"參考資料"}</H2>
          <Ol>
            <Li>
              {"T. K. Ralphs and M. V. Galati, "}
              <em>{"Decomposition in Integer Linear Programming"}</em>
              {", Optimization Online, 2004. "}
              <A href="https://optimization-online.org/2004/12/1029/">
                {"optimization-online.org/2004/12/1029"}
              </A>
            </Li>
            <Li>
              {"M. V. Galati, "}
              <em>{"Decomposition Methods for Integer Linear Programming"}</em>
              {"（PhD dissertation, Lehigh University, 2009）. "}
              <A href="https://coral.ise.lehigh.edu/~ted/files/papers/MatthewGalatiDissertation09.pdf">
                {"coral.ise.lehigh.edu"}
              </A>
            </Li>
            <Li>
              {
                "C. Ge, F. Ma, et al., Decomposition Strategies to Count Integer Solutions over Linear Constraints, "
              }
              <em>{"IJCAI"}</em>
              {", 2021. "}
              <A href="https://www.ijcai.org/proceedings/2021/0192.pdf">
                {"ijcai.org/proceedings/2021/0192"}
              </A>
            </Li>
            <Li>
              {"李鐵軍，"}
              <em>{"數值方法講義 · 第八講（整數規劃）"}</em>
              {"，北京大學。"}
              <A href="https://math.pku.edu.cn/teachers/litj/notes/num_meth/lect8.pdf">
                {"math.pku.edu.cn"}
              </A>
            </Li>
          </Ol>
        </Section>
      </Article>
    </main>
  )
}
