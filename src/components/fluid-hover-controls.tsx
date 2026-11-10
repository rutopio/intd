import { type ReactNode, useLayoutEffect, useRef } from "react"
import { FluidHoverHighlight } from "@/components/fluid-hover-highlight"
import { useFluidHover } from "@/hooks/use-fluid-hover"
import { cn } from "@/lib/utils"

export function FluidHoverControls({
  children,
  className,
  label,
  compact = false,
}: {
  children: ReactNode
  className?: string
  label?: string
  compact?: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<HTMLDivElement>(null)
  const hover = useFluidHover(containerRef, {
    axis: "x",
    nearest: true,
    gapClick: false,
  })

  useLayoutEffect(() => {
    const items = itemsRef.current
    if (!items) return
    let registered: HTMLElement[] = []
    const sync = () => {
      const next = Array.from(items.children).filter(
        (element): element is HTMLElement => element instanceof HTMLElement,
      )
      if (
        next.length === registered.length &&
        next.every((element, index) => element === registered[index])
      )
        return

      registered.forEach((_, index) => {
        hover.registerItem(index, null)
      })
      next.forEach((element, index) => {
        hover.registerItem(index, element)
      })
      registered = next
    }
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(items, { childList: true })
    return () => {
      observer.disconnect()
      registered.forEach((_, index) => {
        hover.registerItem(index, null)
      })
    }
  }, [hover.registerItem])

  const handleFocus = (target: EventTarget) => {
    const items = itemsRef.current
    if (!(target instanceof Node) || !items) return
    const index = Array.from(items.children).findIndex((element) =>
      element.contains(target),
    )
    if (index >= 0) hover.setActiveIndex(index)
  }

  return (
    // biome-ignore lint/a11y/useSemanticElements: A fieldset adds default layout and form behavior to this hover container.
    <div
      role="group"
      aria-label={label}
      ref={containerRef}
      className={cn("relative rounded-lg", className)}
      {...hover.handlers}
      onFocusCapture={(event) => handleFocus(event.target)}
      onBlurCapture={(event) => {
        if (
          !containerRef.current?.contains(event.relatedTarget as Node | null)
        ) {
          hover.setActiveIndex(null)
        }
      }}
    >
      <FluidHoverHighlight hover={hover} className="z-10 rounded-lg" />
      <div
        ref={itemsRef}
        className={cn(
          "relative z-20 flex items-center gap-2",
          compact && "gap-0 min-[360px]:gap-2",
        )}
      >
        {children}
      </div>
    </div>
  )
}
