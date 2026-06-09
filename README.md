# TanStack Start + shadcn/ui

This is a template for a new TanStack Start project with React, TypeScript, and shadcn/ui.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button";
```

## Internationalization (i18n)

The app is bilingual (Traditional Chinese / English) via i18next.

- **Routing is asymmetric**: Chinese is the bare path (`/`, `/algo`, `/about`);
  English is prefixed with `/en` (`/en`, `/en/algo`, `/en/about`).
- The URL is the single source of truth for language. `src/hooks/use-lang.ts`
  derives it from the path; `src/routes/__root.tsx` (`LangSync`) syncs i18next
  and `document.lang` on navigation.
- UI strings live in `src/locales/{zh,en}.json`. Keep the two files in key parity.
- Long-form content (algo/about) lives as per-locale MDX under
  `src/content/{zh_tw,en}/`. The shared page components in
  `src/components/pages/` pick the MDX body by language.

Known limitation: `index.html` `canonical`/`og:locale` are static (`zh_TW`); this
SPA has no SSR, so per-locale head tags are not emitted.
