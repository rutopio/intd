import { createFileRoute } from "@tanstack/react-router"
import { App } from "@/components/pages/app"
import { searchSchema } from "@/lib/schema"

export const Route = createFileRoute("/en/")({
  component: App,
  validateSearch: searchSchema,
})
