import { CopyIcon } from "@phosphor-icons/react";
import { Button } from "@rutopio/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@rutopio/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@rutopio/ui/drawer";
import { useIsNarrowViewport } from "@rutopio/ui/use-is-narrow-viewport";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { JsonHighlight } from "@/components/json-highlight";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettings } from "@/hooks/use-settings";
import type { DecompositionResult } from "@/lib/decomposition";
import { formats } from "@/lib/result-formatters";

export function CopyDialog({
  result,
  onClose,
}: {
  result: DecompositionResult | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [tab, setTab] = useState("markdown");
  const [showTotal, setShowTotal] = useState(true);
  const [showUnit, setShowUnit] = useState(true);
  const isNarrowViewport = useIsNarrowViewport();
  const { bagName } = useSettings();

  // Display names for the copied-format toast, keyed by tab value.
  const FORMAT_LABELS: Record<string, string> = {
    markdown: t("copy.tabMarkdown"),
    table: t("copy.tabTable"),
    list: t("copy.tabList"),
    json: t("copy.tabJson"),
  };

  const handleCopy = async () => {
    if (!result) return;
    const text = formats[tab as keyof typeof formats](
      result,
      showTotal,
      showUnit,
      bagName,
      t
    );
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("copy.copied"), {
        description: t("copy.formatLabel", { format: FORMAT_LABELS[tab] }),
      });
      onClose();
    } catch {
      toast.error(t("copy.copyFailed"));
    }
  };

  const body = (
    <>
      <Tabs value={tab} onValueChange={setTab} className="w-full min-w-0">
        <TabsList className="w-full min-w-0">
          <TabsTrigger value="markdown">{t("copy.tabMarkdown")}</TabsTrigger>
          <TabsTrigger value="table">{t("copy.tabTable")}</TabsTrigger>
          <TabsTrigger value="list">{t("copy.tabList")}</TabsTrigger>
          <TabsTrigger value="json">{t("copy.tabJson")}</TabsTrigger>
        </TabsList>
        {(["markdown", "table", "list", "json"] as const).map((v) => (
          <TabsContent key={v} value={v} className="w-full min-w-0">
            {result &&
              (v === "json" ? (
                <JsonHighlight
                  code={formats[v](result, showTotal, showUnit, bagName, t)}
                />
              ) : (
                <>
                  <pre className="bg-muted max-h-64 max-w-full overflow-auto rounded-md p-3 font-mono text-xs">
                    {formats[v](result, showTotal, showUnit, bagName, t)}
                  </pre>
                  {v === "table" && (
                    <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
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
  );

  if (isNarrowViewport) {
    return (
      <Drawer open={result !== null} onOpenChange={(o) => !o && onClose()}>
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
    );
  }

  return (
    <Dialog open={result !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("copy.title")}</DialogTitle>
        </DialogHeader>
        {body}
      </DialogContent>
    </Dialog>
  );
}
