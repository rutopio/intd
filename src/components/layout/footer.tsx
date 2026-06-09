import { cn } from "@/lib/utils"

export function Footer({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn("mt-auto w-full", className)}>
      <div className="mx-auto w-full max-w-4xl p-12 text-center text-muted-foreground text-xs">
        本工具僅為演算法的實作演示
        <a
          href="https://github.com/rutopio"
          target="_blank"
          rel="noreferrer"
          className="mt-1 block font-mono underline underline-offset-4 hover:text-foreground"
        >
          Created by ChingRu (rutopio@Github)
        </a>
      </div>
    </footer>
  )
}
