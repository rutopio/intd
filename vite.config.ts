import mdx from "@mdx-js/rollup"
import tailwindcss from "@tailwindcss/vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import viteReact from "@vitejs/plugin-react"
import rehypeKatex from "rehype-katex"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import { defineConfig } from "vite"

// Injects <link rel="preload"> for the fonts that would otherwise flash on
// first paint (FOUT with font-display: swap). The body/heading fonts come from
// @fontsource and are hashed at build time, so their final paths are only known
// after bundling — this plugin reads them from the emitted assets. Paper Mono
// has a fixed public/ path. Preloading gives these top priority so they usually
// arrive before first paint, making the swap invisible while swap still
// guarantees the custom font is eventually used (unlike `optional`).
const PRELOAD_FONT_MATCHERS = [
  /albert-sans-latin-wght-normal.*\.woff2$/,
  /host-grotesk-latin-wght-normal.*\.woff2$/,
]
const PUBLIC_PRELOAD_FONTS = ["/fonts/PaperMono%5Bwght%5D.woff2"]

const fontPreloadPlugin = {
  name: "font-preload",
  transformIndexHtml: {
    order: "post" as const,
    handler(html: string, ctx: { bundle?: Record<string, { type: string }> }) {
      const hrefs: string[] = [...PUBLIC_PRELOAD_FONTS]
      // In dev there is no bundle; only the fixed public path is preloaded.
      if (ctx.bundle) {
        for (const name of Object.keys(ctx.bundle)) {
          if (
            ctx.bundle[name]?.type === "asset" &&
            PRELOAD_FONT_MATCHERS.some((re) => re.test(name))
          ) {
            hrefs.push(`/${name}`)
          }
        }
      }
      const tags = hrefs
        .map(
          (href) =>
            `    <link rel="preload" href="${href}" as="font" type="font/woff2" crossorigin>`,
        )
        .join("\n")
      return html.replace("</head>", `${tags}\n  </head>`)
    },
  },
}

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    // MDX must run before React/TanStack so .mdx is JSX by the time they see it.
    {
      enforce: "pre",
      ...mdx({
        remarkPlugins: [remarkGfm, remarkMath],
        rehypePlugins: [rehypeKatex],
      }),
    },
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    viteReact(),
    tailwindcss(),
    fontPreloadPlugin,
  ],
})
