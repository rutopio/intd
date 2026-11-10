import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { CheckIcon, GithubLogoIcon, ListIcon } from "@phosphor-icons/react"
import { Link, useLocation, useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { FluidHoverControls } from "@/components/fluid-hover-controls"
import { LanguageToggle } from "@/components/language-toggle"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button, buttonVariants } from "@/components/ui/button"
import { useLang } from "@/hooks/use-lang"
import { GITHUB_URL } from "@/lib/constants"
import { cn } from "@/lib/utils"

const headerActionClass =
  "cursor-default transition-[background-color,border-color,color,opacity,box-shadow,scale] duration-150 ease-in-out active:scale-[0.96] active:translate-y-0!"
const routeLinkClass =
  "flex h-9 items-center whitespace-nowrap rounded-lg px-3 font-medium text-base text-foreground focus-visible:outline-2 focus-visible:outline-ring aria-[current=page]:bg-muted"
const routeMenuItemClass =
  "flex cursor-default items-center justify-between gap-2 rounded-sm px-3 py-1.5 text-base text-foreground outline-none focus:bg-accent focus:text-accent-foreground"

export function Header({ className }: React.HTMLAttributes<HTMLElement>) {
  const lang = useLang()
  const pathname = useLocation({ select: (location) => location.pathname })
  const navigate = useNavigate()
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
        aria-label="Main navigation"
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
                  d="M500,0v63h131v674h-131v63h201v-800ZM0,0v800h201v-63h-131v-674h131v-63ZM559,544h-31l-103-111c-7-7-14-14-21-21c-7-6-13-11-17-15c12-9,24-21,36-34l101-108h35v-63h-426v63h34l101,109c12,13,22,22,35,33c-11,9-24,22-35,33l-106,114h-29v63h426v-63ZM400,255c19,0,35-1,46-2l1,3c-13,7-23,16-46,39l-19,19c-16,16-30,42-35,53h-4c-5-11-22-39-39-56l-15-16c-21-23-31-32-46-39l1-3c11,1,27,2,46,2h110ZM289,544c-9,0-18,0-27,0s-16,1-21,2l-2-3c16-11,29-23,50-44l15-15c17-17,33-43,38-59h4c5,16,21,39,40,59l15,15c21,21,34,33,50,44l-2,3c-5-1-11-2-20-2s-19,0-28,0h-112Z"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </span>
          </Link>
          <div className="md:hidden">
            <MenuPrimitive.Root>
              <MenuPrimitive.Trigger
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
              <MenuPrimitive.Portal>
                <MenuPrimitive.Positioner
                  align="start"
                  side="bottom"
                  sideOffset={4}
                  className="isolate z-50 outline-none"
                >
                  <MenuPrimitive.Popup
                    aria-label={t("nav.menu")}
                    className="z-50 min-w-40 rounded-md bg-popover p-1 text-popover-foreground shadow-md outline-none ring-1 ring-foreground/10"
                  >
                    <MenuPrimitive.Item
                      aria-current={isHome ? "page" : undefined}
                      className={routeMenuItemClass}
                      onClick={() =>
                        navigate({ to: lang === "en" ? "/en" : "/" })
                      }
                    >
                      {t("nav.decompose")}
                      {isHome && <CheckIcon aria-hidden="true" />}
                    </MenuPrimitive.Item>
                    <MenuPrimitive.Item
                      aria-current={isAlgo ? "page" : undefined}
                      className={routeMenuItemClass}
                      onClick={() => navigate({ to: algoPath })}
                    >
                      {t("nav.algo")}
                      {isAlgo && <CheckIcon aria-hidden="true" />}
                    </MenuPrimitive.Item>
                    <MenuPrimitive.Item
                      aria-current={isAbout ? "page" : undefined}
                      className={routeMenuItemClass}
                      onClick={() => navigate({ to: aboutPath })}
                    >
                      {t("nav.about")}
                      {isAbout && <CheckIcon aria-hidden="true" />}
                    </MenuPrimitive.Item>
                  </MenuPrimitive.Popup>
                </MenuPrimitive.Positioner>
              </MenuPrimitive.Portal>
            </MenuPrimitive.Root>
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
