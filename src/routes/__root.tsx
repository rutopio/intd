import { BreakpointIndicator } from "@rutopio/ui/breakpoint-indicator";
import { PageTransition } from "@rutopio/ui/page-transition";
import { SiteLayout } from "@rutopio/ui/site-layout";
import { Toaster } from "@rutopio/ui/sonner";
import { createRootRoute, Outlet, useLocation } from "@tanstack/react-router";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { NotFound } from "@/components/layout/not-found";
import { useLang } from "@/hooks/use-lang";

// Query and hash updates retain page state and do not restart the entrance animation.
function AnimatedOutlet() {
  const pathname = useLocation({ select: (location) => location.pathname });
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
  );
}

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});

function RootLayout() {
  const lang = useLang();
  return (
    <SiteLayout>
      <a
        href="#main-content"
        className="focus:bg-background focus:outline-ring sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:px-3 focus:py-2 focus:outline-2"
      >
        {lang === "en" ? "Skip to main content" : "跳到主要內容"}
      </a>
      <Header className="bg-background" />
      <AnimatedOutlet />
      <Footer className="bg-background" />
      {import.meta.env.DEV && <BreakpointIndicator />}
      <Toaster position="top-center" closeButton />
    </SiteLayout>
  );
}
