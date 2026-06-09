declare module "*.mdx" {
  import type { ComponentType } from "react"

  // Loose by design: the MDX component map mixes HTML-element overrides (each
  // with its own DOM props) and custom components, which no single strict prop
  // type covers. MDX itself does not type-check the map against the body.
  const MDXComponent: ComponentType<{
    // biome-ignore lint/suspicious/noExplicitAny: MDX component map is heterogeneous
    components?: Record<string, ComponentType<any>>
  }>
  export default MDXComponent
}
