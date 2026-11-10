import { AUTHOR_PROFILE_URL } from "@/lib/constants"
import { cn } from "@/lib/utils"

export function Footer({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn("mt-auto w-full", className)}>
      <div className="w-full py-12 text-center font-mono text-muted-foreground/60 text-sm">
        <a
          href={AUTHOR_PROFILE_URL}
          target="_blank"
          rel="noreferrer"
          className="block hover:text-foreground"
        >
          Created by ChingRu
        </a>
      </div>
    </footer>
  )
}
