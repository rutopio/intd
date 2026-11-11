import { PageTransition } from "@rutopio/base-component/page-transition"
import { SiteLayout } from "@rutopio/base-component/site-layout"
import { Toaster } from "@rutopio/base-component/sonner"
import { createRootRoute, Outlet, useLocation } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { ScreenSize } from "@/components/screen-size"
import { useLang } from "@/hooks/use-lang"

// Soft fade-in on route change: the new page mounts at opacity 0 and animates to
// 1. No exit animation and no AnimatePresence, so the old page is never faded to
// blank first — no flash. Keyed on pathname so changing ?p on a page does not
// re-trigger. Honours prefers-reduced-motion.
function AnimatedOutlet() {
  const pathname = useLocation({ select: (location) => location.pathname })
  return (
    <PageTransition key={pathname}>
      <div
        id="main-content"
        tabIndex={-1}
        className="flex min-w-0 flex-auto flex-col"
      >
        <Outlet />
      </div>
    </PageTransition>
  )
}

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
})

function RootLayout() {
  const lang = useLang()
  return (
    <SiteLayout>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:outline-2 focus:outline-ring"
      >
        {lang === "en" ? "Skip to main content" : "跳到主要內容"}
      </a>
      <Header className="bg-background" />
      <AnimatedOutlet />
      <Footer className="bg-background" />
      <ScreenSize />
      <Toaster position="top-center" closeButton />
    </SiteLayout>
  )
}

function NotFound() {
  const { t } = useTranslation()
  return (
    <main className="flex w-full min-w-0 flex-col py-16">
      <h1>{t("notFound.title")}</h1>
      <p>{t("notFound.desc")}</p>
    </main>
  )
}
