import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/pages/home-page";
import { prepareCalculationRoute } from "@/lib/prepare-calculation-route";
import { searchSchema } from "@/lib/schema";

export const Route = createFileRoute("/en/")({
  component: HomePage,
  beforeLoad: prepareCalculationRoute,
  validateSearch: searchSchema,
});
