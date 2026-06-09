import { isValidElement } from "react"
import { Pseudocode } from "@/components/pseudocode"
import { cn } from "@/lib/utils"

// Typographic primitives + MDX component map for the /algo page. These were
// extracted from a shared prose.tsx, but /algo is the only consumer, so they
// live here. Inline math is handled at build time by rehype-katex ($...$), so
// no KaTeX runtime component is needed.

// Wraps the rendered MDX; sets the long-form rhythm (gap, leading) for /algo.
export function Article({
  className,
  ...props
}: React.ComponentProps<"article">) {
  return (
    <article
      className={cn(
        "flex flex-col gap-2 text-pretty text-sm leading-loose",
        className,
      )}
      {...props}
    />
  )
}

function H1({ className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      className={cn("text-balance font-semibold text-2xl", className)}
      {...props}
    />
  )
}

function H2({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      className={cn("text-balance pt-8 font-semibold text-xl", className)}
      {...props}
    />
  )
}

function H3({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      className={cn("text-balance pt-6 font-semibold text-lg", className)}
      {...props}
    />
  )
}

function P({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-pretty", className)} {...props} />
}

function A({ className, href, ...props }: React.ComponentProps<"a">) {
  const external = href?.startsWith("http")
  return (
    <a
      href={href}
      className={cn(
        "wrap-break-word font-medium text-primary underline underline-offset-4 hover:no-underline",
        className,
      )}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...props}
    />
  )
}

function Muted({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("text-pretty text-muted-foreground", className)}
      {...props}
    />
  )
}

function Ul({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      className={cn("flex list-disc flex-col gap-1 pl-5", className)}
      {...props}
    />
  )
}

function Ol({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      className={cn("flex list-decimal flex-col gap-1 pl-5", className)}
      {...props}
    />
  )
}

function Li(props: React.ComponentProps<"li">) {
  return <li {...props} />
}

// Plain monospace block for ASCII diagrams (e.g. the decision tree); no syntax
// highlighting, so digits/arrows render as-is.
function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="my-4 overflow-x-auto rounded-md border bg-muted/40 p-4 font-mono text-xs leading-relaxed">
      <code>{children}</code>
    </pre>
  )
}

// A fenced code block arrives as <pre><code>…</code></pre>; pull the raw text
// out of the inner <code> and render it through CodeBlock.
function Pre({ children }: { children?: React.ReactNode }) {
  const code = isValidElement<{ children?: React.ReactNode }>(children)
    ? children.props.children
    : children
  return <CodeBlock>{String(code)}</CodeBlock>
}

export const mdxComponents = {
  h1: H1,
  h2: H2,
  h3: H3,
  p: P,
  a: A,
  ul: Ul,
  ol: Ol,
  li: Li,
  pre: Pre,
  Muted,
  Pseudocode,
}
