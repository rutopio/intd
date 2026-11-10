import { TranslateIcon } from "@phosphor-icons/react"
import { useLocation, useNavigate } from "@tanstack/react-router"
import { HeaderActionDropdown } from "@/components/header-action-dropdown"
import { getLangFromPath } from "@/lib/language"

// Asymmetric routing: zh is the bare path, en is prefixed with /en. Toggling adds
// or strips the /en prefix while keeping the rest of the path and search params.
export function LanguageToggle({ className }: { className?: string }) {
  const navigate = useNavigate()
  const pathname = useLocation({ select: (l) => l.pathname })
  const isEn = getLangFromPath(pathname) === "en"

  const changeLanguage = (language: "en" | "zh") => {
    if (isEn === (language === "en")) return
    const next =
      language === "zh"
        ? pathname.replace(/^\/en/, "") || "/"
        : `/en${pathname === "/" ? "" : pathname}`
    navigate({ to: next, search: true })
  }

  return (
    <HeaderActionDropdown
      label={isEn ? "Language" : "語言"}
      icon={<TranslateIcon className="size-4" aria-hidden="true" />}
      className={className}
      selectedId={isEn ? "en" : "zh"}
      items={[
        { id: "zh", label: "繁體中文", onSelect: () => changeLanguage("zh") },
        { id: "en", label: "English", onSelect: () => changeLanguage("en") },
      ]}
    />
  )
}
