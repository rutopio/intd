import { Fragment } from "react"

const KEYWORDS = new Set([
  "function",
  "for",
  "in",
  "if",
  "break",
  "continue",
  "and",
  "or",
  "return",
  "sort",
  "by",
  "mod",
  "asc",
  "desc",
  "first",
  "with",
  "distinct",
  "relax",
])

const TOKEN_RE = /([A-Za-z_]\w*|\d+(?:\.\d+)?)/g

function highlightCode(line: string) {
  const hashIdx = line.indexOf("#")
  const code = hashIdx >= 0 ? line.slice(0, hashIdx) : line
  const comment = hashIdx >= 0 ? line.slice(hashIdx) : ""

  const parts: React.ReactNode[] = []
  let last = 0
  for (const m of code.matchAll(TOKEN_RE)) {
    const idx = m.index
    const tok = m[0]
    if (idx > last) parts.push(code.slice(last, idx))
    if (KEYWORDS.has(tok)) {
      parts.push(
        <span
          key={`${idx}-${tok}`}
          className="font-medium text-violet-600 dark:text-violet-400"
        >
          {tok}
        </span>,
      )
    } else if (/^\d/.test(tok)) {
      parts.push(
        <span
          key={`${idx}-${tok}`}
          className="text-amber-600 dark:text-amber-400"
        >
          {tok}
        </span>,
      )
    } else {
      parts.push(tok)
    }
    last = idx + tok.length
  }
  if (last < code.length) parts.push(code.slice(last))

  return (
    <>
      {parts}
      {comment && (
        <span className="text-muted-foreground italic">{comment}</span>
      )}
    </>
  )
}

export function Pseudocode({ code }: { code: string }) {
  const lines = code.split("\n")
  return (
    <pre className="overflow-x-auto rounded-md border bg-muted/40 p-4 font-mono text-xs leading-relaxed">
      <code>
        {lines.map((line, i) => (
          <Fragment key={i}>
            {highlightCode(line)}
            {i < lines.length - 1 && "\n"}
          </Fragment>
        ))}
      </code>
    </pre>
  )
}
