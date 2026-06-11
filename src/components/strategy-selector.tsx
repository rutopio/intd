import { useTranslation } from "react-i18next"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { SortMode } from "@/lib/decompose"

// Two-way segmented control for the decomposition strategy, plus its hint line.
export function StrategySelector({
  sortMode,
  onChange,
}: {
  sortMode: SortMode
  onChange: (mode: SortMode) => void
}) {
  const { t } = useTranslation()
  return (
    <>
      <RadioGroup
        value={sortMode}
        onValueChange={(v) => onChange(v as SortMode)}
        aria-label={t("home.strategyLabel")}
        data-mode={sortMode}
        className="group relative grid h-9 w-full grid-cols-2 items-center gap-0 rounded-md bg-input/50 p-0.5 font-medium text-sm after:absolute after:inset-y-0.5 after:left-0.5 after:w-[calc(50%-2px)] after:rounded-sm after:bg-background after:shadow-xs after:transition-[translate] after:duration-200 after:ease-out data-[mode=balance]:after:translate-x-full motion-reduce:after:transition-none"
      >
        <label
          htmlFor="sort-bags"
          className="relative z-10 inline-flex h-full cursor-pointer select-none items-center justify-center whitespace-nowrap text-muted-foreground transition-colors has-data-checked:text-foreground"
        >
          {t("home.strategyBags")}
          <RadioGroupItem id="sort-bags" className="sr-only" value="bags" />
        </label>
        <label
          htmlFor="sort-balance"
          className="relative z-10 inline-flex h-full cursor-pointer select-none items-center justify-center whitespace-nowrap text-muted-foreground transition-colors has-data-checked:text-foreground"
        >
          {t("home.strategyBalance")}
          <RadioGroupItem
            id="sort-balance"
            className="sr-only"
            value="balance"
          />
        </label>
      </RadioGroup>
      <p className="px-1 text-center text-muted-foreground text-xs leading-relaxed">
        {sortMode === "bags"
          ? t("home.strategyBagsHint")
          : t("home.strategyBalanceHint")}
      </p>
    </>
  )
}
