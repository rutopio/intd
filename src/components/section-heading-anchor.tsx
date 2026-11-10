import { LinkIcon } from "@phosphor-icons/react"
import type { ReactNode } from "react"

export function SectionHeadingAnchor({
  id,
  children,
}: {
  id?: string
  children: ReactNode
}) {
  if (!id) return <span>{children}</span>

  return (
    <a href={`#${id}`} className="relative inline text-inherit no-underline">
      <span
        className="absolute top-1/2 -left-6 flex h-4 w-5 -translate-y-1/2 items-center justify-end opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 sm:-left-8"
        aria-hidden="true"
      >
        <LinkIcon className="size-4 text-neutral-400 dark:text-neutral-500" />
      </span>
      {children}
    </a>
  )
}
