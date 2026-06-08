import { createRootRoute, Outlet, useLocation } from "@tanstack/react-router"
import { motion, useReducedMotion } from "motion/react"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { ScreenSize } from "@/components/screen-size"
import { Toaster } from "@/components/ui/sonner"

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
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex flex-auto flex-col"
    >
      <Outlet />
    </motion.div>
  )
}

export const Route = createRootRoute({
  component: () => (
    <div className="flex min-h-dvh flex-col">
      <Header className="bg-background" />
      <AnimatedOutlet />
      <Footer className="bg-background" />
      <ScreenSize />
      <Toaster position="top-center" closeButton />
    </div>
  ),
  notFoundComponent: () => (
    <main className="container mx-auto p-4 pt-16">
      <h1>404</h1>
      <p>The requested page could not be found.</p>
    </main>
  ),
})
