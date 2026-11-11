import { fileURLToPath } from "node:url";
import mdx from "@mdx-js/rollup";
import { rehypeCode } from "@rutopio/ui/rehype-code";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { defineConfig } from "vite";
import { rehypeArticleSections } from "./src/lib/rehype-article-sections.ts";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  plugins: [
    // MDX must run before React/TanStack so .mdx is JSX by the time they see it.
    {
      enforce: "pre",
      ...mdx({
        remarkPlugins: [remarkGfm, remarkMath],
        rehypePlugins: [
          rehypeKatex,
          rehypeSlug,
          rehypeCode,
          rehypeArticleSections,
        ],
      }),
    },
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    viteReact(),
    tailwindcss(),
  ],
});
