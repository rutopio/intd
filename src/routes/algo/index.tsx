import { createFileRoute } from "@tanstack/react-router";
import { Algo } from "@/components/pages/algo";

export const Route = createFileRoute("/algo/")({ component: Algo });
