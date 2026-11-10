import { useTranslation } from "react-i18next"
import { AUTHOR_GITHUB_URL } from "@/lib/constants"
import { cn } from "@/lib/utils"

export function Footer({ className }: React.HTMLAttributes<HTMLElement>) {
    const { t } = useTranslation()
    return (
        <footer className={cn("mt-auto w-full", className)}>
            <div className="w-full py-12 text-center text-muted-foreground/60 text-sm">
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
