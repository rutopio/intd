import { Tex } from "@/components/tex"
import { cn } from "@/lib/utils"

// Shared typographic primitives for long-form copy (e.g. the /algo page).
// Modeled after an MDX component map: each element carries its default
// className and forwards the rest, so call sites stay free of repeated styles.
//
// Why strings over JSX text nodes: the formatter reflows raw CJK text in JSX
// at the print width, and every wrap point becomes a literal space that shows
// up mid-sentence (CJK has no word spaces). Passing copy as a string child
// keeps it on one logical token the formatter won't split; interleave <M>
// (inline math) between adjacent string runs for mixed text + formula lines.

function Article({ className, ...props }: React.ComponentProps<"article">) {
  return (
    <article
      className={cn(
        "flex flex-col gap-6 text-pretty text-sm leading-loose",
        className,
      )}
      {...props}
    />
  )
}

function Section({ className, ...props }: React.ComponentProps<"section">) {
  return <section className={cn("flex flex-col gap-3", className)} {...props} />
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
      className={cn("text-balance font-medium text-lg", className)}
      {...props}
    />
  )
}

function H3({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      className={cn("mt-2 text-balance font-medium text-base", className)}
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
        "break-words font-medium text-primary underline underline-offset-4 hover:no-underline",
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

function Formula({ children }: { children: string }) {
  return (
    <div className="my-4 overflow-x-auto rounded-md border bg-muted/40 px-4 py-3 text-center">
      <Tex block>{children}</Tex>
    </div>
  )
}

// Inline display math, sugar over <Tex> for call sites.
function M({ children }: { children: string }) {
  return <Tex>{children}</Tex>
}

// Plain monospace block for ASCII diagrams (e.g. decision trees). Unlike
// <Pseudocode> it does no syntax highlighting, so digits/arrows render as-is.
function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="my-4 overflow-x-auto rounded-md border bg-muted/40 p-4 font-mono text-xs leading-relaxed">
      <code>{children}</code>
    </pre>
  )
}

export {
  A,
  Article,
  CodeBlock,
  Formula,
  H1,
  H2,
  H3,
  Li,
  M,
  Muted,
  Ol,
  P,
  Section,
  Ul,
}
