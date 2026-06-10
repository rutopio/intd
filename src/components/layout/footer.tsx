import { useTranslation } from "react-i18next"
import { AUTHOR_GITHUB_URL } from "@/lib/constants"
import { cn } from "@/lib/utils"

export function Footer({ className }: React.HTMLAttributes<HTMLElement>) {
  const { t } = useTranslation()
  return (
    <footer className={cn("mt-auto w-full", className)}>
      <div className="mx-auto w-full max-w-4xl p-12 text-center text-muted-foreground/60 text-xs">
        {t("footer.disclaimer")}
        <a
          href={AUTHOR_GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-1 block font-mono hover:text-foreground"
        >
          Created by ChingRu (rutopio@Github)
        </a>
      </div>
    </footer>
  )
}
