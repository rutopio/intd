import {
  Article,
  articleComponents,
  articleLinkClassName,
} from "@rutopio/ui/article"

export { Article }

import { GithubMarkIcon } from "@rutopio/ui/github-mark-icon"
import { isValidElement } from "react"
import { Pseudocode } from "@/components/pseudocode"
import { cn } from "@/lib/utils"

function A({ className, href, ...props }: React.ComponentProps<"a">) {
  const external = href?.startsWith("http")
  return (
    <a
      href={href}
      className={cn(articleLinkClassName, className)}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...props}
    />
  )
}

function GithubRepoLink({ children, ...props }: React.ComponentProps<"a">) {
  return (
    <A className="whitespace-nowrap" {...props}>
      <span
        aria-hidden="true"
        className="mr-1 inline-block h-4 w-4 align-[-0.125em] text-primary [&>svg]:size-full"
      >
        <GithubMarkIcon />
      </span>
      {children}
    </A>
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
  ...articleComponents,
  a: A,
  pre: Pre,
  Muted,
  Pseudocode,
  GithubRepoLink,
}
