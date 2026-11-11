import { createFileRoute } from "@tanstack/react-router";
import { App } from "@/components/pages/home-page";
import { prepareCalculationRoute } from "@/lib/prepare-calculation-route";
import { searchSchema } from "@/lib/schema";

export const Route = createFileRoute("/")({
  component: App,
  beforeLoad: prepareCalculationRoute,
  validateSearch: searchSchema,
});
