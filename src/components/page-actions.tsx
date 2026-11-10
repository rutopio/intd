import { ArrowBendRightUpIcon } from "@phosphor-icons/react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { FluidHoverControls } from "@/components/fluid-hover-controls"
import { ShareButton } from "@/components/share-button"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"

type OutlineItem = {
  id: string
  label: string
  depth: 2 | 3
}

function ReadingProgressRing({ progress }: { progress: number }) {
  const circumference = 2 * Math.PI * 6.25

  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 -rotate-90">
      <circle
        cx="8"
        cy="8"
        r="6.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        className="opacity-20"
      />
      <circle
        cx="8"
        cy="8"
        r="6.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={(1 - progress) * circumference}
        className="transition-[stroke-dashoffset] duration-150"
      />
    </svg>
  )
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function PageActions() {
  const { t } = useTranslation()
  const [items, setItems] = useState<OutlineItem[]>([])
  const [activeId, setActiveId] = useState("")
  const [progress, setProgress] = useState(0)
  const [outlineOpen, setOutlineOpen] = useState(false)

  useEffect(() => {
    const article = document.querySelector("main article")
    if (!article) return

    const update = () => {
      const headings = Array.from(
        article.querySelectorAll<HTMLElement>("h2[id], h3[id]"),
      )
      setItems(
        headings
          .map((heading) => ({
            id: heading.id,
            label: heading.textContent?.trim() ?? "",
            depth: heading.tagName === "H3" ? (3 as const) : (2 as const),
          }))
          .filter((item) => item.label),
      )
    }

    update()
    const observer = new MutationObserver(update)
    observer.observe(article, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight
      setProgress(
        scrollable > 0
          ? Math.min(1, Math.max(0, window.scrollY / scrollable))
          : 1,
      )

      const line =
        window.scrollY + Math.max(120, Math.round(window.innerHeight / 3))
      let current = ""
      for (const item of items) {
        const heading = document.getElementById(item.id)
        if (
          heading &&
          heading.getBoundingClientRect().top + window.scrollY <= line
        ) {
          current = item.id
        }
      }
      if (
        window.scrollY >=
        document.documentElement.scrollHeight - window.innerHeight - 2
      ) {
        current = items.at(-1)?.id ?? current
      }
      setActiveId(current)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule, { passive: true })
    const observer = new ResizeObserver(schedule)
    observer.observe(document.body)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
      observer.disconnect()
    }
  }, [items])

  const navigateToHeading = (id: string) => {
    setOutlineOpen(false)
    const reduceMotion = prefersReducedMotion()
    window.setTimeout(
      () => {
        const heading = document.getElementById(id)
        if (!heading) return
        heading.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" })
        history.replaceState(null, "", `#${encodeURIComponent(id)}`)
      },
      reduceMotion ? 0 : 320,
    )
  }

  const actions = (
    <>
      {items.length > 0 && (
        <Button
          variant="outline"
          size="icon-lg"
          aria-label={`${Math.round(progress * 100)}% · ${t("pageActions.outline")}`}
          onClick={() => setOutlineOpen(true)}
        >
          <ReadingProgressRing progress={progress} />
        </Button>
      )}
      <ShareButton size="icon-lg" />
      <Button
        variant="outline"
        size="icon-lg"
        aria-label={t("pageActions.scrollToTop")}
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: prefersReducedMotion() ? "auto" : "smooth",
          })
        }
      >
        <ArrowBendRightUpIcon className="size-4" aria-hidden="true" />
      </Button>
    </>
  )

  return (
    <>
      <FluidHoverControls
        buttonGroup
        orientation="horizontal"
        label={t("pageActions.label")}
        className="fixed right-4 bottom-[calc(2rem+env(safe-area-inset-bottom))] z-10 h-fit min-[50rem]:hidden"
      >
        {actions}
      </FluidHoverControls>
      <FluidHoverControls
        buttonGroup
        orientation="vertical"
        label={t("pageActions.label")}
        className="fixed top-1/2 z-10 hidden h-fit -translate-y-1/2 [right:calc((100vw_-_39rem)/2_-_3rem)] min-[50rem]:flex"
      >
        {actions}
      </FluidHoverControls>

      <Drawer open={outlineOpen} onOpenChange={setOutlineOpen}>
        <DrawerContent>
          <DrawerHeader className="border-border border-b pb-4">
            <DrawerTitle>{t("pageActions.outline")}</DrawerTitle>
          </DrawerHeader>
          <nav
            aria-label={t("pageActions.outline")}
            className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-6"
          >
            <ul className="flex flex-col">
              {items.map((item) => (
                <li
                  key={item.id}
                  className={
                    item.depth === 3
                      ? "ml-3 border-primary/20 border-l pl-3"
                      : undefined
                  }
                >
                  <a
                    href={`#${encodeURIComponent(item.id)}`}
                    data-active={activeId === item.id || undefined}
                    onClick={(event) => {
                      event.preventDefault()
                      navigateToHeading(item.id)
                    }}
                    className={`block py-1 text-base transition-colors ${
                      activeId === item.id
                        ? "font-semibold text-primary"
                        : "text-foreground"
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </DrawerContent>
      </Drawer>
    </>
  )
}
