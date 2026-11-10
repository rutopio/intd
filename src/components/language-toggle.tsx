import { CheckIcon, TranslateIcon } from "@phosphor-icons/react"
import { ActionMenu } from "@rutopio/base-component/action-menu"
import { useLocation, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/use-mobile"
import { getLangFromPath } from "@/lib/language"

// Asymmetric routing: zh is the bare path, en is prefixed with /en. Toggling adds
// or strips the /en prefix while keeping the rest of the path and search params.
export function LanguageToggle({ className }: { className?: string }) {
  const navigate = useNavigate()
  const pathname = useLocation({ select: (l) => l.pathname })
  const isEn = getLangFromPath(pathname) === "en"
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const label = isEn ? "Language" : "語言"

  const changeLanguage = (language: "en" | "zh") => {
    if (isEn === (language === "en")) return
    const next =
      language === "zh"
        ? pathname.replace(/^\/en/, "") || "/"
        : `/en${pathname === "/" ? "" : pathname}`
    navigate({ to: next, search: true })
  }

  return isMobile ? (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className={className}
            aria-label={label}
          >
            <TranslateIcon aria-hidden="true" />
          </Button>
        }
      />
      <DrawerContent>
        <DrawerHeader className="border-border border-b pb-4">
          <DrawerTitle>{label}</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col gap-1 px-4 pt-4 pb-6">
          {(
            [
              ["zh", "繁體中文"],
              ["en", "English"],
            ] as const
          ).map(([language, name]) => (
            <button
              key={language}
              type="button"
              lang={language === "zh" ? "zh-Hant" : "en"}
              aria-current={isEn === (language === "en") ? "true" : undefined}
              className="flex min-h-10 items-center justify-between rounded-lg px-3 text-left text-base text-foreground focus-visible:outline-2 focus-visible:outline-ring aria-[current=true]:bg-muted"
              onClick={() => {
                setOpen(false)
                changeLanguage(language)
              }}
            >
              {name}
              {isEn === (language === "en") && <CheckIcon aria-hidden="true" />}
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  ) : (
    <ActionMenu
      label={label}
      trigger={<TranslateIcon className="size-4" aria-hidden="true" />}
      triggerClassName={className}
      indicator={<CheckIcon className="size-4" aria-hidden="true" />}
      items={[
        {
          id: "zh",
          label: "繁體中文",
          active: !isEn,
          ariaCurrent: !isEn ? "true" : undefined,
          onSelect: () => changeLanguage("zh"),
        },
        {
          id: "en",
          label: "English",
          active: isEn,
          ariaCurrent: isEn ? "true" : undefined,
          onSelect: () => changeLanguage("en"),
        },
      ]}
    />
  )
}
