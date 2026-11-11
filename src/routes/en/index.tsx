import { createFileRoute } from "@tanstack/react-router";
import { App } from "@/components/pages/app";
import { prepareCalculationRoute } from "@/lib/prepare-calculation-route";
import { searchSchema } from "@/lib/schema";

export const Route = createFileRoute("/en/")({
  component: App,
  beforeLoad: prepareCalculationRoute,
  validateSearch: searchSchema,
});
