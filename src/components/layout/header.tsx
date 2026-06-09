import { CalculatorIcon, GithubLogoIcon } from "@phosphor-icons/react"
import { Link } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { LanguageToggle } from "@/components/language-toggle"
import { ThemeToggle } from "@/components/theme-toggle"
import { buttonVariants } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { useLang } from "@/hooks/use-lang"
import { cn } from "@/lib/utils"

const GITHUB_URL = "https://github.com/rutopio/intd"

// Bare paths (zh). The en routes mirror these under /en, so links prefix at render.
const navItems = [
  // "/" is a prefix of every path, so it needs exact matching to avoid always being active
  {
    labelKey: "nav.decompose",
    shortKey: "nav.decomposeShort",
    to: "/",
    exact: true,
  },
  {
    labelKey: "nav.algo",
    shortKey: "nav.algoShort",
    to: "/algo",
    exact: false,
  },
  {
    labelKey: "nav.about",
    shortKey: "nav.aboutShort",
    to: "/about",
    exact: false,
  },
] as const

export function Header({ className }: React.HTMLAttributes<HTMLElement>) {
  const { t } = useTranslation()
  const lang = useLang()
  // en routes live under /en; map the bare paths to the active language.
  const localize = (to: string) =>
    lang === "en" ? (to === "/" ? "/en" : `/en${to}`) : to
  return (
    <header className={cn("w-full", className)}>
      <nav
        aria-label="Main navigation"
        className="mx-auto flex w-full max-w-4xl flex-row items-center justify-between p-6 sm:p-12"
      >
        <div className="flex flex-row items-center gap-2 lg:gap-4">
          <Link
            to={localize("/")}
            aria-label="IntD - Integer Decomposition Calculator"
            className="flex flex-row items-center gap-2"
          >
            <CalculatorIcon size={28} aria-hidden="true" weight="duotone" />
            <span className="hidden font-semibold text-base sm:inline sm:text-lg">
              IntD
            </span>
          </Link>
          <NavigationMenu>
            <NavigationMenuList className="flex-nowrap gap-1 lg:gap-4">
              {navItems.map((item) => (
                <NavigationMenuItem key={item.to}>
                  <NavigationMenuLink
                    className="px-3 sm:px-4"
                    render={
                      <Link
                        to={localize(item.to)}
                        activeOptions={item.exact ? { exact: true } : undefined}
                        activeProps={{
                          className: "bg-accent",
                          "aria-current": "page" as const,
                        }}
                      />
                    }
                  >
                    {/* Short label on mobile, full label from sm up. */}
                    <span className="sm:hidden">{t(item.shortKey)}</span>
                    <span className="hidden sm:inline">{t(item.labelKey)}</span>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex flex-row items-center gap-1">
          <ThemeToggle />
          <LanguageToggle />
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
          >
            <GithubLogoIcon className="size-5" aria-hidden="true" />
          </a>
        </div>
      </nav>
    </header>
  )
}
