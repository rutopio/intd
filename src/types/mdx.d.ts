declare module "*.mdx" {
  import type { ComponentType } from "react";

  // MDX maps combine HTML overrides and custom components with unrelated props.
  const MDXComponent: ComponentType<{
    // biome-ignore lint/suspicious/noExplicitAny: MDX component map is heterogeneous
    components?: Record<string, ComponentType<any>>;
  }>;
  export default MDXComponent;
}
