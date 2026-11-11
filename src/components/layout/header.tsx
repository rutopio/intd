import { CheckIcon, GithubLogoIcon, ListIcon } from "@phosphor-icons/react";
import { buttonVariants } from "@rutopio/ui/button";
import { HeaderNavigation, SiteHeader } from "@rutopio/ui/site-header";
import { Link, useLocation } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { useLang } from "@/hooks/use-lang";
import { INTD_ICON_PATH } from "@/lib/brand-icon";
import { GITHUB_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Header({ className }: React.HTMLAttributes<HTMLElement>) {
  const lang = useLang();
  const pathname = useLocation({ select: (location) => location.pathname });
  const { t } = useTranslation();
  const homePath = lang === "en" ? "/en" : "/";
  const items = [
    {
      id: "home",
      label: t("nav.decompose"),
      href: homePath,
      active: pathname === homePath || (lang === "en" && pathname === "/en/"),
    },
    {
      id: "algo",
      label: t("nav.algo"),
      href: lang === "en" ? "/en/algo" : "/algo",
      active: pathname === (lang === "en" ? "/en/algo" : "/algo"),
    },
    {
      id: "about",
      label: t("nav.about"),
      href: lang === "en" ? "/en/about" : "/about",
      active: pathname === (lang === "en" ? "/en/about" : "/about"),
    },
  ];
  return (
    <SiteHeader
      className={cn("font-heading", className)}
      label={lang === "en" ? "Main navigation" : "主要導覽"}
      brand={
        <Link
          to={homePath}
          activeOptions={{ exact: true }}
          aria-label={lang === "en" ? "Home" : "首頁"}
          className="focus-visible:outline-ring flex h-12 shrink-0 items-center gap-2 rounded-md focus-visible:outline-2"
        >
          <span className="flex size-12 items-center justify-center">
            <svg
              aria-hidden="true"
              className="text-foreground h-8 w-7"
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
      }
      navigation={
        <HeaderNavigation
          items={items}
          label={t("nav.menu")}
          title="IntD"
          menuIcon={<ListIcon aria-hidden="true" />}
          selectedIcon={<CheckIcon aria-hidden="true" />}
          renderLink={(item, props) => (
            <Link
              to={item.href}
              activeOptions={{ exact: true }}
              aria-current={props.ariaCurrent}
              onClick={props.onClick}
              className={props.className}
            >
              {props.children}
            </Link>
          )}
        />
      }
      actions={
        <>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={
              lang === "en"
                ? "GitHub (opens in a new tab)"
                : "GitHub（在新分頁開啟）"
            }
            className={buttonVariants({ variant: "ghost", size: "icon" })}
          >
            <GithubLogoIcon className="size-4" aria-hidden="true" />
          </a>
          <LanguageToggle />
          <ThemeToggle />
        </>
      }
    />
  );
}
