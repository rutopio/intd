import { LanguageToggle as BaseLanguageToggle } from "@rutopio/ui/language-toggle"
import { useIsMobile } from "@rutopio/ui/use-mobile"
import { useLocation, useNavigate } from "@tanstack/react-router"
import { getLangFromPath } from "@/lib/language"

const options = [
  { value: "zh", label: "繁體中文", htmlLang: "zh-Hant" },
  { value: "en", label: "English", htmlLang: "en" },
] as const

// zh uses the bare path; en uses the /en prefix.
export function LanguageToggle({ className }: { className?: string }) {
  const navigate = useNavigate()
  const pathname = useLocation({ select: (l) => l.pathname })
  const current = getLangFromPath(pathname)
  const isMobile = useIsMobile()

  return (
    <BaseLanguageToggle
      label={current === "en" ? "Language" : "語言"}
      current={current}
      options={options}
      isMobile={isMobile}
      className={className}
      onChange={(language) => {
        if (language === current) return
        const next =
          language === "zh"
            ? pathname.replace(/^\/en/, "") || "/"
            : `/en${pathname === "/" ? "" : pathname}`
        navigate({ to: next, search: true })
      }}
    />
  )
}
