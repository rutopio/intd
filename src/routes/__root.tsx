import { createRootRoute, Outlet } from "@tanstack/react-router"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { ScreenSize } from "@/components/screen-size"
import { Toaster } from "@/components/ui/sonner"

export const Route = createRootRoute({
  component: () => (
    <div className="flex min-h-dvh flex-col">
      <Header className="bg-background" />
      {/* <main className="mx-auto flex w-full min-w-0 flex-auto flex-col p-6 sm:max-w-4xl sm:p-12"> */}
      <Outlet />
      {/* </main> */}
      <Footer className="bg-background" />
      <ScreenSize />
      <Toaster position="top-center" />
    </div>
  ),
  notFoundComponent: () => (
    <main className="container mx-auto p-4 pt-16">
      <h1>404</h1>
      <p>The requested page could not be found.</p>
    </main>
  ),
})
