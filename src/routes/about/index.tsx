import { createFileRoute } from "@tanstack/react-router"
import { Article, mdxComponents } from "@/components/mdx"
import Content from "@/content/zh_tw/about.mdx"

export const Route = createFileRoute("/about/")({ component: About })

function About() {
  return (
    <main className="mx-auto w-full p-6 sm:max-w-4xl sm:p-12">
      <Article>
        <Content components={mdxComponents} />
      </Article>
    </main>
  )
}
