import { createRootRoute, Outlet } from "@tanstack/react-router"
import { Header } from "@/components/header"

export const Route = createRootRoute({
  component: () => (
    <>
      <Header className="fixed top-0 left-0 z-50" />
      <Outlet />
    </>
  ),
  notFoundComponent: () => (
    <main className="container mx-auto p-4 pt-16">
      <h1>404</h1>
      <p>The requested page could not be found.</p>
    </main>
  ),
})
