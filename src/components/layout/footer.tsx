import { AUTHOR_PROFILE_URL } from "@/lib/constants"
import { cn } from "@/lib/utils"

export function Footer({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn("mt-auto w-full", className)}>
      <div className="w-full py-12 text-center font-mono text-muted-foreground text-sm">
        <div className="flex flex-col items-center gap-2">
          <a
            href="https://github.com/rutopio/intd"
            target="_blank"
            rel="noreferrer"
            className="block rounded-sm hover:text-foreground hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-ring"
          >
            rutopio/intd
          </a>
          <a
            href={AUTHOR_PROFILE_URL}
            target="_blank"
            rel="noreferrer"
            className="block rounded-sm hover:text-foreground hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-ring"
          >
            Created by ChingRu
          </a>
        </div>
      </div>
    </footer>
  )
}
