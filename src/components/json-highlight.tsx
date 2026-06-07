import { Fragment } from "react"

const TOKEN_RE = /"(?:\\.|[^"\\])*"|-?\d+(?:\.\d+)?|true|false|null|[{}[\]:,]/g

function highlightLine(line: string) {
  const parts: React.ReactNode[] = []
  let last = 0
  for (const m of line.matchAll(TOKEN_RE)) {
    const idx = m.index
    const tok = m[0]
    if (idx > last) parts.push(line.slice(last, idx))

    let cls = ""
    if (tok.startsWith('"')) {
      const rest = line.slice(idx + tok.length).trimStart()
      cls = rest.startsWith(":")
        ? "text-violet-600 dark:text-violet-400"
        : "text-emerald-600 dark:text-emerald-400"
    } else if (/^-?\d/.test(tok)) {
      cls = "text-amber-600 dark:text-amber-400"
    } else if (tok === "true" || tok === "false" || tok === "null") {
      cls = "text-violet-600 dark:text-violet-400"
    } else {
      cls = "text-muted-foreground"
    }

    parts.push(
      <span key={`${idx}-${tok}`} className={cls}>
        {tok}
      </span>,
    )
    last = idx + tok.length
  }
  if (last < line.length) parts.push(line.slice(last))
  return parts
}

export function JsonHighlight({ code }: { code: string }) {
  const lines = code.split("\n")
  return (
    <pre className="max-h-64 overflow-auto rounded-md bg-muted p-3 font-mono text-xs">
      <code>
        {lines.map((line, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: line order is fixed, index is a stable key
          <Fragment key={i}>
            {highlightLine(line)}
            {i < lines.length - 1 && "\n"}
          </Fragment>
        ))}
      </code>
    </pre>
  )
}
