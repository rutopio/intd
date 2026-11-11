import {
  Article,
  articleComponents,
  articleLinkClassName,
} from "@rutopio/ui/article";

export { Article };

import { GithubMarkIcon } from "@rutopio/ui/github-mark-icon";
import { cn } from "@/lib/utils";

function A({ className, href, ...props }: React.ComponentProps<"a">) {
  const external = href?.startsWith("http");
  return (
    <a
      href={href}
      className={cn(articleLinkClassName, className)}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...props}
    />
  );
}

function GithubRepoLink({ children, ...props }: React.ComponentProps<"a">) {
  return (
    <A className="whitespace-nowrap" {...props}>
      <span
        aria-hidden="true"
        className="text-primary mr-1 inline-block h-4 w-4 align-[-0.125em] [&>svg]:size-full"
      >
        <GithubMarkIcon />
      </span>
      {children}
    </A>
  );
}

function Muted({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "text-muted-foreground text-base leading-[1.65] text-pretty",
        className
      )}
      {...props}
    />
  );
}

export const mdxComponents = {
  ...articleComponents,
  a: A,
  Muted,
  GithubRepoLink,
};
