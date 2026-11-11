import {
  Article,
  articleComponents,
  articleLinkClassName,
} from "@rutopio/ui/article"

export { Article }

import { GithubMarkIcon } from "@rutopio/ui/github-mark-icon"
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

export const mdxComponents = {
  ...articleComponents,
  a: A,
  Muted,
  GithubRepoLink,
}
