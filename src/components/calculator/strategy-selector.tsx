import { useTranslation } from "react-i18next";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { SortMode } from "@/lib/decomposition";

export function StrategySelector({
  sortMode,
  onChange,
}: {
  sortMode: SortMode;
  onChange: (mode: SortMode) => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      <RadioGroup
        value={sortMode}
        onValueChange={(v) => onChange(v as SortMode)}
        aria-label={t("home.strategyLabel")}
        data-mode={sortMode}
        className="group bg-input/50 after:bg-background relative grid h-9 w-full grid-cols-2 items-center gap-0 rounded-md p-0.5 text-base font-semibold after:absolute after:inset-y-0.5 after:left-0.5 after:w-[calc(50%-2px)] after:rounded-sm after:shadow-xs after:transition-[translate] after:duration-200 after:ease-out data-[mode=balance]:after:translate-x-full motion-reduce:after:transition-none"
      >
        <label
          htmlFor="sort-bags"
          className="text-muted-foreground has-data-checked:text-foreground relative z-10 inline-flex h-full items-center justify-center whitespace-nowrap transition-colors select-none"
        >
          {t("home.strategyBags")}
          <RadioGroupItem id="sort-bags" className="sr-only" value="bags" />
        </label>
        <label
          htmlFor="sort-balance"
          className="text-muted-foreground has-data-checked:text-foreground relative z-10 inline-flex h-full items-center justify-center whitespace-nowrap transition-colors select-none"
        >
          {t("home.strategyBalance")}
          <RadioGroupItem
            id="sort-balance"
            className="sr-only"
            value="balance"
          />
        </label>
      </RadioGroup>
      <p className="text-muted-foreground px-1 text-center text-sm leading-relaxed">
        {sortMode === "bags"
          ? t("home.strategyBagsHint")
          : t("home.strategyBalanceHint")}
      </p>
    </>
  );
}
