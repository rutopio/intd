import {
  FacebookLogoIcon,
  LinkIcon,
  ShareNetworkIcon,
  ThreadsLogoIcon,
  XLogoIcon,
} from "@phosphor-icons/react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

function openShareWindow(url: string) {
  window.open(url, "_blank", "noopener,noreferrer,width=600,height=600")
}

export function ShareButton() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const shareUrl = typeof window !== "undefined" ? window.location.href : ""
  const encodedUrl = encodeURIComponent(shareUrl)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success(t("share.copied"), { description: shareUrl })
    } catch {
      toast.error(t("share.copyFailed"))
    }
  }

  // Touch devices prefer the native share sheet; pointer devices use the dialog.
  // navigator.share only exists on secure origins, so dev over a LAN IP falls back to the dialog.
  const handleShareClick = async () => {
    const isTouch =
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches

    if (isTouch && navigator.share) {
      try {
        await navigator.share({ title: document.title, url: shareUrl })
      } catch (err) {
        if (!(err instanceof Error && err.name === "AbortError")) {
          setOpen(true)
        }
      }
      return
    }
    setOpen(true)
  }

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        aria-label={t("share.label")}
        onClick={handleShareClick}
      >
        <ShareNetworkIcon aria-hidden="true" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("share.title")}</DialogTitle>
            <DialogDescription>{t("share.desc")}</DialogDescription>
          </DialogHeader>
          <Input
            value={shareUrl}
            disabled
            aria-label={t("share.currentUrl")}
            className="bg-muted"
          />
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant="outline"
              className="h-auto flex-col gap-1.5 py-3 [&_svg:not([class*='size-'])]:size-6"
              onClick={() =>
                openShareWindow(
                  `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
                )
              }
            >
              <FacebookLogoIcon aria-hidden="true" />
              <span className="text-xs">Facebook</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-1.5 py-3 [&_svg:not([class*='size-'])]:size-6"
              onClick={() =>
                openShareWindow(
                  `https://twitter.com/intent/tweet?url=${encodedUrl}`,
                )
              }
            >
              <XLogoIcon aria-hidden="true" />
              <span className="text-xs">X</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-1.5 py-3 [&_svg:not([class*='size-'])]:size-6"
              onClick={() =>
                openShareWindow(
                  `https://www.threads.net/intent/post?url=${encodedUrl}`,
                )
              }
            >
              <ThreadsLogoIcon aria-hidden="true" />
              <span className="text-xs">Threads</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-1.5 py-3 [&_svg:not([class*='size-'])]:size-6"
              onClick={handleCopy}
            >
              <LinkIcon aria-hidden="true" />
              <span className="text-xs">{t("share.copyLink")}</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
