import { rehypeArticleSections as sharedSections } from "@rutopio/ui/rehype-article-sections"

const CONTENT_PATH = /(^|\/)src\/content\/(?:en|zh_tw)\/(?:algo|about)\.mdx$/

export function rehypeArticleSections() {
  const transform = sharedSections()
  return (tree: Parameters<typeof transform>[0], file: { path?: string }) => {
    if (file.path && CONTENT_PATH.test(file.path)) transform(tree)
  }
}
