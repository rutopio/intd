import { CurrencyCircleDollarIcon } from "@phosphor-icons/react"
import { useTranslation } from "react-i18next"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"

// Amount field with the inline decompose button and its inline error message.
export function AmountInput({
  amount,
  error,
  onChange,
  onSubmit,
}: {
  amount: string
  error: string | null
  onChange: (value: string) => void
  onSubmit: () => void
}) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-1 flex-col gap-1">
      <InputGroup className="w-full" aria-invalid={error !== null}>
        <InputGroupAddon>
          <CurrencyCircleDollarIcon aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput
          autoFocus
          type="text"
          inputMode="numeric"
          placeholder={t("home.amountPlaceholder")}
          aria-label={t("home.amountLabel")}
          aria-invalid={error !== null}
          aria-describedby={error ? "amount-error" : undefined}
          value={amount}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          className="font-mono"
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            variant="default"
            className="text-xs"
            onClick={onSubmit}
          >
            {t("home.decompose")}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {error && (
        <p
          id="amount-error"
          className="px-1 text-destructive text-xs"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
}
