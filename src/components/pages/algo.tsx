import { Article, mdxComponents } from "@/components/mdx"
import EnContent from "@/content/en/algo.mdx"
import ZhContent from "@/content/zh_tw/algo.mdx"
import { useLang } from "@/hooks/use-lang"

// Shared Algorithm page, rendered by both / (zh) and /en routes. Picks the MDX
// body by language; both are statically imported so each ships in its own chunk.
export function Algo() {
  const lang = useLang()
  const Content = lang === "en" ? EnContent : ZhContent
  return (
    <main className="mx-auto w-full p-6 sm:max-w-4xl sm:p-12">
      <Article>
        <Content components={mdxComponents} />
      </Article>
    </main>
  )
}
