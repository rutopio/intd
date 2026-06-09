import { createFileRoute } from "@tanstack/react-router"
import Content from "@/content/zh_tw/algo.mdx"
import { Article, mdxComponents } from "@/components/mdx"

export const Route = createFileRoute("/algo/")({ component: Algo })

function Algo() {
  return (
    <main className="mx-auto w-full p-6 sm:max-w-4xl sm:p-12">
      <Article>
        <Content components={mdxComponents} />
      </Article>
    </main>
  )
}
