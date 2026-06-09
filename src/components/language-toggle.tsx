import { TranslateIcon } from "@phosphor-icons/react"
import { useLocation, useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Asymmetric routing: zh is the bare path, en is prefixed with /en. Toggling adds
// or strips the /en prefix while keeping the rest of the path and search params.
export function LanguageToggle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"button">) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const pathname = useLocation({ select: (l) => l.pathname })
  const isEn = pathname === "/en" || pathname.startsWith("/en/")

  const toggle = () => {
    const next = isEn
      ? pathname.replace(/^\/en/, "") || "/"
      : `/en${pathname === "/" ? "" : pathname}`
    navigate({ to: next, search: true })
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={isEn ? t("lang.toChinese") : t("lang.toEnglish")}
      className={cn(className)}
      {...props}
    >
      <TranslateIcon
        size={16}
        aria-hidden="true"
        className="transition-transform duration-150 ease-in-out group-hover/button:scale-110"
      />
      <span className="sr-only">{isEn ? "中" : "EN"}</span>
    </Button>
  )
}
