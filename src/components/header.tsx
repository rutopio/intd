import { CalculatorIcon, GithubLogoIcon } from "@phosphor-icons/react"
import { Link } from "@tanstack/react-router"
import { ThemeToggle } from "@/components/theme-toggle"
import { buttonVariants } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"

const GITHUB_URL = "https://github.com/ChingRu/idc"

const navItems = [
  { label: "分解", to: "/", exact: true },
  { label: "說明", to: "/algo", exact: false },
] as const

export function Header({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <header className={cn("w-full", className)}>
      <nav
        aria-label="Main navigation"
        className="mx-auto flex w-full max-w-4xl flex-row items-center justify-between p-12"
      >
        <div className="flex flex-row items-center gap-1 lg:gap-4">
          <Link to="/" aria-label="Home">
            <CalculatorIcon size={28} aria-hidden="true" />
          </Link>
          <NavigationMenu>
            <NavigationMenuList className="flex-nowrap gap-1 lg:gap-4">
              {navItems.map((item) => (
                <NavigationMenuItem key={item.to}>
                  <NavigationMenuLink
                    render={
                      <Link
                        to={item.to}
                        activeOptions={item.exact ? { exact: true } : undefined}
                        activeProps={{
                          className: "bg-accent",
                          "aria-current": "page" as const,
                        }}
                      />
                    }
                  >
                    {item.label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex flex-row items-center gap-1">
          <ThemeToggle />
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
