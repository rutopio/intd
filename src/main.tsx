import { RouterProvider } from "@tanstack/react-router"
import { ThemeProvider } from "next-themes"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import i18n from "./lib/i18n"
import { getLangFromPath } from "./lib/language"
import { getRouter } from "./router"
import "katex/dist/katex.min.css"
import "./styles.css"

const router = getRouter()

function syncLanguage(pathname: string) {
  const lang = getLangFromPath(pathname)
  if (i18n.language !== lang) void i18n.changeLanguage(lang)
  document.documentElement.lang = lang === "en" ? "en" : "zh-Hant"
}

syncLanguage(window.location.pathname)
router.subscribe("onBeforeRouteMount", ({ toLocation }) => {
  syncLanguage(toLocation.pathname)
})

// Track the initial load and SPA navigations; gtag config disables automatic page views.
router.subscribe("onResolved", ({ fromLocation, toLocation }) => {
  window.gtag?.("event", "page_view", {
    page_path: toLocation.pathname,
    page_location: window.location.href,
    page_referrer: fromLocation
      ? new URL(fromLocation.href, window.location.origin).href
      : document.referrer,
  })
})

// biome-ignore lint/style/noNonNullAssertion: #root is defined in index.html
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
)
