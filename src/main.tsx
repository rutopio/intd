import { RouterProvider } from "@tanstack/react-router"
import { ThemeProvider } from "next-themes"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { getRouter } from "./router"
import "./lib/i18n"
import "katex/dist/katex.min.css"
import "./styles.css"

const router = getRouter()

// Track SPA navigations as GA page_view events (initial load is sent by gtag config).
router.subscribe("onResolved", ({ toLocation }) => {
  window.gtag?.("event", "page_view", {
    page_path: toLocation.pathname,
    page_location: window.location.href,
  })
})

// biome-ignore lint/style/noNonNullAssertion: #root is defined in index.html
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
)
