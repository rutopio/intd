import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { App } from "@/components/pages/app"

const searchSchema = z.object({
  p: z.coerce.number().int().positive().max(99999).optional().catch(undefined),
})

export const Route = createFileRoute("/en/")({
  component: App,
  validateSearch: searchSchema,
})
