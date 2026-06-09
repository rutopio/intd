import { CopyIcon } from "@phosphor-icons/react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { JsonHighlight } from "@/components/json-highlight"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useIsMobile } from "@/hooks/use-mobile"
import { useSettings } from "@/hooks/use-settings"
import type { Item } from "@/lib/decompose"
import { formats } from "@/lib/format"

export function CopyDialog({
  item,
  onClose,
}: {
  item: Item | null
  onClose: () => void
}) {
  const { t } = useTranslation()
  const [tab, setTab] = useState("markdown")
  const [showTotal, setShowTotal] = useState(true)
  const [showUnit, setShowUnit] = useState(true)
  const isMobile = useIsMobile()
  const { bagName } = useSettings()

  // Display names for the copied-format toast, keyed by tab value.
  const FORMAT_LABELS: Record<string, string> = {
    markdown: t("copy.tabMarkdown"),
    table: t("copy.tabTable"),
    list: t("copy.tabList"),
    json: t("copy.tabJson"),
  }

  const handleCopy = async () => {
    if (!item) return
    const text = formats[tab as keyof typeof formats](
      item,
      showTotal,
      showUnit,
      bagName,
      t,
    )
    try {
      await navigator.clipboard.writeText(text)
      toast.success(t("copy.copied"), {
        description: t("copy.formatLabel", { format: FORMAT_LABELS[tab] }),
      })
      onClose()
    } catch {
      toast.error(t("copy.copyFailed"))
    }
  }

  const body = (
    <>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full">
          <TabsTrigger value="markdown">{t("copy.tabMarkdown")}</TabsTrigger>
          <TabsTrigger value="table">{t("copy.tabTable")}</TabsTrigger>
          <TabsTrigger value="list">{t("copy.tabList")}</TabsTrigger>
          <TabsTrigger value="json">{t("copy.tabJson")}</TabsTrigger>
        </TabsList>
        {(["markdown", "table", "list", "json"] as const).map((v) => (
          <TabsContent key={v} value={v}>
            {item &&
              (v === "json" ? (
                <JsonHighlight
                  code={formats[v](item, showTotal, showUnit, bagName, t)}
                />
              ) : (
                <>
                  <pre className="max-h-64 overflow-auto rounded-md bg-muted p-3 font-mono text-xs">
                    {formats[v](item, showTotal, showUnit, bagName, t)}
                  </pre>
                  {v === "table" && (
                    <p className="mt-2 font-mono text-muted-foreground text-xs leading-relaxed">
                      {t("copy.monoHint")}
                    </p>
                  )}
                </>
              ))}
          </TabsContent>
        ))}
      </Tabs>
      <div
        className={`flex items-center gap-2 ${tab === "json" ? "opacity-50" : ""}`}
      >
        <Switch
          id="show-total"
          checked={showTotal}
          onCheckedChange={setShowTotal}
          disabled={tab === "json"}
        />
        <Label htmlFor="show-total">{t("copy.showTotal")}</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          id="show-unit"
          checked={showUnit}
          onCheckedChange={setShowUnit}
        />
        <Label htmlFor="show-unit">{t("copy.showUnit")}</Label>
      </div>
      <Button className="w-full" onClick={handleCopy}>
        <CopyIcon aria-hidden="true" />
        {t("copy.copy")}
      </Button>
    </>
  )

  if (isMobile) {
    return (
      <Drawer open={item !== null} onOpenChange={(o) => !o && onClose()}>
        <DrawerContent className="text-left">
          <DrawerHeader className="text-left">
            <DrawerTitle>{t("copy.title")}</DrawerTitle>
          </DrawerHeader>
          <div className="flex flex-col gap-4 px-4">{body}</div>
          <DrawerFooter>
            <Button variant="outline" onClick={onClose}>
              {t("copy.close")}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={item !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("copy.title")}</DialogTitle>
        </DialogHeader>
        {body}
      </DialogContent>
    </Dialog>
  )
}
