import { createFileRoute } from "@tanstack/react-router";
import { Algo } from "@/components/pages/algorithm-page";

export const Route = createFileRoute("/algo/")({ component: Algo });
