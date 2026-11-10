import { createRootRoute, Outlet, useLocation } from "@tanstack/react-router"
import { motion, useReducedMotion } from "motion/react"
import { useTranslation } from "react-i18next"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { ScreenSize } from "@/components/screen-size"
import { Toaster } from "@/components/ui/sonner"
import { useLang } from "@/hooks/use-lang"

// Soft fade-in on route change: the new page mounts at opacity 0 and animates to
// 1. No exit animation and no AnimatePresence, so the old page is never faded to
// blank first — no flash. Keyed on pathname so changing ?p on a page does not
// re-trigger. Honours prefers-reduced-motion.
function AnimatedOutlet() {
  const pathname = useLocation({ select: (l) => l.pathname })
  const reduce = useReducedMotion()
  return (
    <motion.div
      key={pathname}
      id="main-content"
      tabIndex={-1}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex min-w-0 flex-auto flex-col"
    >
      <Outlet />
    </motion.div>
  )
}

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
})

function RootLayout() {
  const lang = useLang()
  return (
    <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col px-3 min-[360px]:px-6">
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
    </div>
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
