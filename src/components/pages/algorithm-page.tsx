import { Article, mdxComponents } from "@/components/mdx/mdx-components";
import { PageActions } from "@/components/navigation/page-actions";
import EnContent from "@/content/en/algo.mdx";
import ZhContent from "@/content/zh_tw/algo.mdx";
import { useLang } from "@/hooks/use-lang";

export function AlgorithmPage() {
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
