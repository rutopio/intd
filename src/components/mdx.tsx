import { isValidElement } from "react"
import { Pseudocode } from "@/components/pseudocode"
import { SectionHeadingAnchor } from "@/components/section-heading-anchor"
import { cn } from "@/lib/utils"

// Writing's article typography, shared by /algo and /about. Inline math is
// handled at build time by rehype-katex ($...$).

export function Article({
  className,
  ...props
}: React.ComponentProps<"article">) {
  return (
    <article
      className={cn(
        // min-w-0 lets flex children shrink so wide math scrolls inside
        // .katex-display instead of widening the page.
        "flex min-w-0 flex-col gap-6 text-base text-neutral-800 leading-[1.65] dark:text-neutral-300",
        className,
      )}
      {...props}
    />
  )
}

function H1({ className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      className={cn(
        "opsz-25 scroll-m-20 text-balance font-bold font-heading text-lg text-neutral-950 leading-[1.65] dark:text-neutral-50",
        className,
      )}
      {...props}
    />
  )
}

function H2({ className, id, children, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      id={id}
      className={cn(
        "group opsz-25 flex scroll-mt-14 items-center text-balance font-bold font-heading text-lg text-neutral-950 leading-[1.65] dark:text-neutral-50",
        className,
      )}
      {...props}
    >
      <SectionHeadingAnchor id={id}>{children}</SectionHeadingAnchor>
      <span
        aria-hidden="true"
        className="ml-4 h-0.5 min-w-4 flex-1 scale-y-50 bg-border"
      />
    </h2>
  )
}

function H3({ className, id, children, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      id={id}
      className={cn(
        "group opsz-25 flex scroll-m-20 items-center text-balance font-bold font-heading text-lg text-neutral-950 leading-[1.65] dark:text-neutral-50",
        className,
      )}
      {...props}
    >
      <SectionHeadingAnchor id={id}>{children}</SectionHeadingAnchor>
    </h3>
  )
}

function P({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "text-pretty text-base text-neutral-800 leading-[1.65] dark:text-neutral-300",
        className,
      )}
      {...props}
    />
  )
}

function A({ className, href, ...props }: React.ComponentProps<"a">) {
  const external = href?.startsWith("http")
  return (
    <a
      href={href}
      className={cn(
        "opsz-14 break-words font-normal text-primary underline decoration-[0.5px] underline-offset-4 transition-[color,text-decoration-thickness] duration-150 hover:text-neutral-950 hover:decoration-[1px] dark:hover:text-neutral-50",
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
      className={cn(
        "text-pretty text-base text-muted-foreground leading-[1.65]",
        className,
      )}
      {...props}
    />
  )
}

function Ul({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      className={cn("ml-6 flex list-disc flex-col gap-1", className)}
      {...props}
    />
  )
}

function Ol({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      className={cn("ml-6 flex list-decimal flex-col gap-1", className)}
      {...props}
    />
  )
}

function Li({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      className={cn(
        "text-pretty text-base text-neutral-800 leading-[1.65] dark:text-neutral-300",
        className,
      )}
      {...props}
    />
  )
}

function Strong({ className, ...props }: React.ComponentProps<"strong">) {
  return (
    <strong className={cn("opsz-18 font-semibold", className)} {...props} />
  )
}

// Plain monospace block for ASCII diagrams (e.g. the decision tree); no syntax
// highlighting, so digits/arrows render as-is.
function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-md border bg-muted/40 p-4 font-mono text-base leading-relaxed">
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
  strong: Strong,
  pre: Pre,
  Muted,
  Pseudocode,
}
