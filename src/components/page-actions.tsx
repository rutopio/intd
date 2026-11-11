import { ArrowBendRightUpIcon, ArrowLeftIcon } from "@phosphor-icons/react"
import { ActionMenu } from "@rutopio/ui/action-menu"
import { Button } from "@rutopio/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@rutopio/ui/drawer"
import {
  OutlineList,
  type OutlineListItem,
} from "@rutopio/ui/outline-list"
import { ReadingProgressRing } from "@rutopio/ui/outline-nav"
import { PageActionRail } from "@rutopio/ui/page-action-rail"
import { navigateToSection } from "@rutopio/ui/section-navigation"
import { useMountEffect } from "@rutopio/ui/use-mount-effect"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { ShareButton } from "@/components/share-button"

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function PageActions({
  drawerTitleKey = "nav.algo",
}: {
  drawerTitleKey?: string
}) {
  const { t } = useTranslation()
  const [items, setItems] = useState<OutlineListItem[]>([])
  const [activeId, setActiveId] = useState("")
  const [progress, setProgress] = useState(0)
  const [outlineOpen, setOutlineOpen] = useState(false)
  const selectedId = activeId || items[0]?.id || ""
  const drawerScrollRef = useRef<HTMLElement>(null)

  useMountEffect(() => {
    const article = document.querySelector("main article")
    if (!article) return
    setItems(
      Array.from(article.querySelectorAll<HTMLElement>("h2[id], h3[id]"))
        .map((heading) => {
          const visibleHeading = heading.cloneNode(true) as HTMLElement
          visibleHeading.querySelectorAll(".katex-mathml").forEach((node) => {
            node.remove()
          })
          return {
            id: heading.id,
            label: visibleHeading.textContent?.trim() ?? "",
            depth: heading.tagName === "H3" ? (3 as const) : (2 as const),
          }
        })
        .filter((item) => item.label),
    )
  })

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      if (document.body.style.position === "fixed") return
      const scrollY = window.scrollY
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight
      setProgress(
        scrollable > 0 ? Math.min(1, Math.max(0, scrollY / scrollable)) : 1,
      )
      const line = scrollY + Math.max(120, Math.round(window.innerHeight / 3))
      let current = ""
      for (const item of items) {
        const heading = document.getElementById(item.id)
        if (heading && heading.getBoundingClientRect().top + scrollY <= line)
          current = item.id
      }
      if (scrollY >= scrollable - 2) current = items.at(-1)?.id ?? current
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

  useEffect(() => {
    if (!outlineOpen) return
    const frame = requestAnimationFrame(() => {
      const viewport = drawerScrollRef.current
      const active = viewport?.querySelector<HTMLElement>("[data-active]")
      if (!viewport || !active) return
      const viewportRect = viewport.getBoundingClientRect()
      const activeRect = active.getBoundingClientRect()
      viewport.scrollTop +=
        activeRect.top -
        viewportRect.top -
        viewport.clientHeight / 2 +
        activeRect.height / 2
    })
    return () => cancelAnimationFrame(frame)
  }, [outlineOpen])

  const navigateToHeading = (id: string) => {
    navigateToSection(id, () => setOutlineOpen(false))
  }

  const utilities = (
    <>
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
    <PageActionRail
      label={t("pageActions.label")}
      mobileOutline={
        <>
          {items.length > 0 && (
            <Drawer open={outlineOpen} onOpenChange={setOutlineOpen}>
              <DrawerTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon-lg"
                    aria-label={`${Math.round(progress * 100)}% · ${t("pageActions.outline")}`}
                  />
                }
              >
                <ReadingProgressRing progress={progress} />
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader className="border-border border-b pb-4">
                  <DrawerTitle>{t(drawerTitleKey)}</DrawerTitle>
                </DrawerHeader>
                <nav
                  ref={drawerScrollRef}
                  aria-label={t("pageActions.outline")}
                  className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-6"
                >
                  <OutlineList
                    items={items}
                    activeId={selectedId}
                    onNavigate={navigateToHeading}
                    indicator={<ArrowLeftIcon className="size-4" />}
                  />
                </nav>
              </DrawerContent>
            </Drawer>
          )}
        </>
      }
      desktopOutline={
        <>
          {items.length > 0 && (
            <ActionMenu
              label={t("pageActions.outline")}
              triggerLabel={`${Math.round(progress * 100)}% · ${t("pageActions.outline")}`}
              trigger={<ReadingProgressRing progress={progress} />}
              side="left"
              indicator={<ArrowLeftIcon className="size-4" />}
              items={items.map((item) => ({
                ...item,
                active: item.id === selectedId,
                ariaCurrent:
                  item.id === selectedId ? ("location" as const) : undefined,
                href: `#${encodeURIComponent(item.id)}`,
                onSelect: (event) => {
                  event.preventDefault()
                  navigateToHeading(item.id)
                },
              }))}
            />
          )}
        </>
      }
      actions={utilities}
    />
  )
}
