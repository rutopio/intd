import { CalculatorIcon, GithubLogoIcon } from "@phosphor-icons/react"
import { Link } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { FluidHoverControls } from "@/components/fluid-hover-controls"
import { LanguageToggle } from "@/components/language-toggle"
import { ThemeToggle } from "@/components/theme-toggle"
import { buttonVariants } from "@/components/ui/button"
import { useLang } from "@/hooks/use-lang"
import { GITHUB_URL } from "@/lib/constants"
import { cn } from "@/lib/utils"

const headerActionClass =
  "cursor-default transition-[background-color,border-color,color,opacity,box-shadow,scale] duration-150 ease-in-out active:scale-[0.96] active:translate-y-0!"

export function Header({ className }: React.HTMLAttributes<HTMLElement>) {
  const lang = useLang()
  const { t } = useTranslation()
  return (
    <header className={cn("w-full font-heading", className)}>
      <nav
        aria-label="Main navigation"
        className="relative flex w-full items-center justify-between pt-6 sm:pt-12"
      >
        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          <Link
            to={lang === "en" ? "/en" : "/"}
            aria-label={lang === "en" ? "Home" : "首頁"}
            className="flex h-12 shrink-0 items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-ring"
          >
            <span className="flex size-12 items-center justify-center">
              <CalculatorIcon size={28} aria-hidden="true" weight="duotone" />
            </span>
            <span className="hidden font-bold text-base sm:inline sm:text-lg">
              IntD
            </span>
          </Link>
          <FluidHoverControls label={lang === "en" ? "Pages" : "頁面"}>
            <Link
              to={lang === "en" ? "/en/algo" : "/algo"}
              activeOptions={{ exact: true }}
              activeProps={{ "aria-current": "page" as const }}
              className="flex h-9 items-center whitespace-nowrap rounded-lg px-1 font-medium text-base text-foreground focus-visible:outline-2 focus-visible:outline-ring aria-[current=page]:bg-muted sm:px-3"
            >
              {t("nav.algo")}
            </Link>
            <Link
              to={lang === "en" ? "/en/about" : "/about"}
              activeOptions={{ exact: true }}
              activeProps={{ "aria-current": "page" as const }}
              className="flex h-9 items-center whitespace-nowrap rounded-lg px-1 font-medium text-base text-foreground focus-visible:outline-2 focus-visible:outline-ring aria-[current=page]:bg-muted sm:px-3"
            >
              {t("nav.about")}
            </Link>
          </FluidHoverControls>
        </div>
        <FluidHoverControls compact>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={
              lang === "en"
                ? "GitHub (opens in a new tab)"
                : "GitHub（在新分頁開啟）"
            }
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              headerActionClass,
            )}
          >
            <GithubLogoIcon className="size-4" aria-hidden="true" />
          </a>
          <LanguageToggle className={headerActionClass} />
          <ThemeToggle className={headerActionClass} />
        </FluidHoverControls>
      </nav>
    </header>
  )
}
