import { createFileRoute } from "@tanstack/react-router";
import { AlgorithmPage } from "@/components/pages/algorithm-page";

export const Route = createFileRoute("/en/algo/")({ component: AlgorithmPage });
