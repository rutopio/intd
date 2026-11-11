import { Article, mdxComponents } from "@/components/mdx";
import { PageActions } from "@/components/page-actions";
import EnContent from "@/content/en/algo.mdx";
import ZhContent from "@/content/zh_tw/algo.mdx";
import { useLang } from "@/hooks/use-lang";

// Shared Algorithm page, rendered by both / (zh) and /en routes. Picks the MDX
// body by language; both are statically imported so each ships in its own chunk.
export function Algo() {
  const lang = useLang();
  const Content = lang === "en" ? EnContent : ZhContent;
  return (
    <main className="flex w-full min-w-0 flex-col py-6 sm:py-12">
      <Article>
        <Content components={mdxComponents} />
      </Article>
      <PageActions key={lang} />
    </main>
  );
}
