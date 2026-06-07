import { createRootRoute, Outlet } from "@tanstack/react-router"
import { Header } from "@/components/header"

export const Route = createRootRoute({
    component: () => (
        <div className="flex flex-col min-h-dvh">
            <Header className="bg-background" />
            {/* <main className="mx-auto flex w-full min-w-0 flex-auto flex-col p-6 sm:max-w-4xl sm:p-12"> */}
            <Outlet />
            {/* </main> */}
        </div>
    ),
    notFoundComponent: () => (
        <main className="container mx-auto p-4 pt-16">
            <h1>404</h1>
            <p>The requested page could not be found.</p>
        </main>
    ),
})
