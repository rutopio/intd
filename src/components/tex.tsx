import katex from "katex"

function Tex({
  children,
  block = false,
}: {
  children: string
  block?: boolean
}) {
  const html = katex.renderToString(children, {
    displayMode: block,
    throwOnError: false,
  })
  return (
    <span
      // biome-ignore lint/security/noDangerouslySetInnerHtml: KaTeX trusted output
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export { Tex }
