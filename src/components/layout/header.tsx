import { CheckIcon, GithubLogoIcon, ListIcon } from "@phosphor-icons/react"
import { Link, useLocation } from "@tanstack/react-router"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { FluidHoverControls } from "@/components/fluid-hover-controls"
import { LanguageToggle } from "@/components/language-toggle"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useLang } from "@/hooks/use-lang"
import { INTD_ICON_PATH } from "@/lib/brand-icon"
import { GITHUB_URL } from "@/lib/constants"
import { cn } from "@/lib/utils"

const headerActionClass =
  "cursor-default transition-[background-color,border-color,color,opacity,box-shadow,scale] duration-150 ease-in-out active:scale-[0.96] active:translate-y-0!"
const routeLinkClass =
  "flex h-9 items-center whitespace-nowrap rounded-lg px-3 font-medium text-base text-foreground focus-visible:outline-2 focus-visible:outline-ring aria-[current=page]:bg-muted"
const drawerLinkClass =
  "flex min-h-10 items-center justify-between rounded-lg px-3 text-base text-foreground focus-visible:outline-2 focus-visible:outline-ring aria-[current=page]:bg-muted"

export function Header({ className }: React.HTMLAttributes<HTMLElement>) {
  const lang = useLang()
  const pathname = useLocation({ select: (location) => location.pathname })
  const [navOpen, setNavOpen] = useState(false)
  const isHome =
    pathname === (lang === "en" ? "/en" : "/") ||
    (lang === "en" && pathname === "/en/")
  const algoPath = lang === "en" ? "/en/algo" : "/algo"
  const aboutPath = lang === "en" ? "/en/about" : "/about"
  const isAlgo = pathname === algoPath
  const isAbout = pathname === aboutPath
  const { t } = useTranslation()
  return (
    <header className={cn("w-full font-heading", className)}>
      <nav
        aria-label={lang === "en" ? "Main navigation" : "主要導覽"}
        className="relative flex w-full items-center justify-between pt-6 sm:pt-12"
      >
        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          <Link
            to={lang === "en" ? "/en" : "/"}
            activeOptions={{ exact: true }}
            aria-label={lang === "en" ? "Home" : "首頁"}
            className="flex h-12 shrink-0 items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-ring"
          >
            <span className="flex size-12 items-center justify-center">
              <svg
                aria-hidden="true"
                className="h-8 w-7 text-foreground"
                fill="currentColor"
                viewBox="0 0 701 800"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d={INTD_ICON_PATH}
                  stroke="currentColor"
                  strokeWidth="0.5"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </span>
          </Link>
          <div className="md:hidden">
            <Drawer open={navOpen} onOpenChange={setNavOpen}>
              <DrawerTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    aria-label={t("nav.menu")}
                    className={headerActionClass}
                  >
                    <ListIcon aria-hidden="true" />
                  </Button>
                }
              />
              <DrawerContent>
                <DrawerHeader className="border-border border-b pb-4">
                  <DrawerTitle>IntD</DrawerTitle>
                </DrawerHeader>
                <nav
                  aria-label={t("nav.menu")}
                  className="flex flex-col gap-1 px-4 pt-4 pb-6"
                >
                  <Link
                    to={lang === "en" ? "/en" : "/"}
                    activeOptions={{ exact: true }}
                    aria-current={isHome ? "page" : undefined}
                    onClick={() => setNavOpen(false)}
                    className={drawerLinkClass}
                  >
                    {t("nav.decompose")}
                    {isHome && <CheckIcon aria-hidden="true" />}
                  </Link>
                  <Link
                    to={algoPath}
                    activeOptions={{ exact: true }}
                    aria-current={isAlgo ? "page" : undefined}
                    onClick={() => setNavOpen(false)}
                    className={drawerLinkClass}
                  >
                    {t("nav.algo")}
                    {isAlgo && <CheckIcon aria-hidden="true" />}
                  </Link>
                  <Link
                    to={aboutPath}
                    activeOptions={{ exact: true }}
                    aria-current={isAbout ? "page" : undefined}
                    onClick={() => setNavOpen(false)}
                    className={drawerLinkClass}
                  >
                    {t("nav.about")}
                    {isAbout && <CheckIcon aria-hidden="true" />}
                  </Link>
                </nav>
              </DrawerContent>
            </Drawer>
          </div>
          <FluidHoverControls
            label={lang === "en" ? "Pages" : "頁面"}
            className="hidden md:flex"
          >
            <Link
              to={lang === "en" ? "/en" : "/"}
              activeOptions={{ exact: true }}
              aria-current={isHome ? "page" : undefined}
              className={cn(routeLinkClass, isHome && "bg-muted")}
            >
              {t("nav.decompose")}
            </Link>
            <Link
              to={algoPath}
              activeOptions={{ exact: true }}
              activeProps={{ "aria-current": "page" as const }}
              className={routeLinkClass}
            >
              {t("nav.algo")}
            </Link>
            <Link
              to={aboutPath}
              activeOptions={{ exact: true }}
              activeProps={{ "aria-current": "page" as const }}
              className={routeLinkClass}
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
