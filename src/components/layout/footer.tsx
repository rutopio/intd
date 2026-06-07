import { cn } from "@/lib/utils"

export function Footer({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn("mt-auto w-full", className)}>
      <div className="mx-auto w-full max-w-4xl p-12 text-center text-muted-foreground text-xs">
        本試算器僅為演算法的實作範例，不應用於其他用途。
      </div>
    </footer>
  )
}
