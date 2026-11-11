import { createFileRoute } from "@tanstack/react-router";
import { Algo } from "@/components/pages/algorithm-page";

export const Route = createFileRoute("/en/algo/")({ component: Algo });
