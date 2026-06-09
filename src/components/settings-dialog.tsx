import { CheckIcon, GearIcon, PlusIcon, XIcon } from "@phosphor-icons/react"
import { useForm } from "@tanstack/react-form"
import { useId, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useIsMobile } from "@/hooks/use-mobile"
import { useSettings } from "@/hooks/use-settings"
import { DEFAULT_BAG_NAME, DEFAULT_ITEMS, MAX_ITEMS } from "@/lib/constants"
import type { ItemConfig } from "@/lib/decompose"
import { createSettingsSchema } from "@/lib/schema"

// Display order of the last-digit toggles: 1-9 then 0.
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]

const NEW_ITEM: ItemConfig = { name: "", min: 0, max: 0, digits: [] }

const numInputClass =
  "flex-1 [-moz-appearance:_textfield] font-mono focus:z-10 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"

export function SettingsDialog() {
  const { t } = useTranslation()
  const { items, setItems, bagName, setBagName } = useSettings()
  const [open, setOpen] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const isMobile = useIsMobile()
  const fieldId = useId()

  const settingsSchema = useMemo(() => createSettingsSchema(t), [t])

  const form = useForm({
    defaultValues: { items, bagName },
    validators: { onSubmit: settingsSchema },
    onSubmit: ({ value }) => {
      setItems(value.items)
      setBagName(value.bagName)
      setOpen(false)
    },
  })

  const handleOpenChange = (next: boolean) => {
    if (next) form.reset({ items, bagName })
    setOpen(next)
  }

  const renderItem = (
    index: number,
    onRemove: () => void,
    canRemove: boolean,
  ) => {
    const label = t("settings.itemLabel", { index: index + 1 })
    return (
      <Card size="sm" className="relative shrink-0 rounded-md">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t("settings.deleteItem", { label })}
          disabled={!canRemove}
          onClick={onRemove}
          className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
        >
          <XIcon aria-hidden="true" />
        </Button>
        <CardContent className="flex flex-col gap-3">
          <div className="flex gap-3">
            <form.Field name={`items[${index}].name`}>
              {(nameField) => (
                <Field
                  className="flex-1"
                  data-invalid={nameField.state.meta.errors.length > 0}
                >
                  <FieldLabel htmlFor={`${fieldId}-${index}-name`}>
                    {t("settings.itemName")}
                  </FieldLabel>
                  <Input
                    id={`${fieldId}-${index}-name`}
                    aria-label={t("settings.aNameOf", { label })}
                    value={nameField.state.value}
                    onBlur={nameField.handleBlur}
                    onChange={(e) => nameField.handleChange(e.target.value)}
                  />
                  <FieldError errors={nameField.state.meta.errors} />
                </Field>
              )}
            </form.Field>

            <form.Field name={`items[${index}].max`}>
              {(maxField) => (
                <Field
                  className="flex-1"
                  data-invalid={maxField.state.meta.errors.length > 0}
                >
                  <FieldLabel htmlFor={`${fieldId}-${index}-min`}>
                    {t("settings.priceRange")}
                  </FieldLabel>
                  <div className="flex">
                    <form.Field name={`items[${index}].min`}>
                      {(minField) => (
                        <InputGroup className="rounded-e-none">
                          <InputGroupAddon>
                            <InputGroupText>$</InputGroupText>
                          </InputGroupAddon>
                          <InputGroupInput
                            aria-label={t("settings.aMinOf", { label })}
                            className={numInputClass}
                            id={`${fieldId}-${index}-min`}
                            placeholder={t("settings.priceMin")}
                            type="number"
                            // Show 0 as empty and store empty as 0, so clearing does not leave a stuck leading 0.
                            value={minField.state.value || ""}
                            onBlur={minField.handleBlur}
                            onChange={(e) =>
                              minField.handleChange(
                                e.target.value === ""
                                  ? 0
                                  : Number(e.target.value),
                              )
                            }
                          />
                        </InputGroup>
                      )}
                    </form.Field>
                    <InputGroup className="-ms-px rounded-s-none">
                      <InputGroupAddon>
                        <InputGroupText>$</InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        aria-label={t("settings.aMaxOf", { label })}
                        className={numInputClass}
                        placeholder={t("settings.priceMax")}
                        type="number"
                        // Show 0 as empty and store empty as 0, so clearing does not leave a stuck leading 0.
                        value={maxField.state.value || ""}
                        onBlur={maxField.handleBlur}
                        onChange={(e) =>
                          maxField.handleChange(
                            e.target.value === "" ? 0 : Number(e.target.value),
                          )
                        }
                      />
                    </InputGroup>
                  </div>
                  <FieldError errors={maxField.state.meta.errors} />
                </Field>
              )}
            </form.Field>
          </div>

          <form.Field name={`items[${index}].digits`}>
            {(field) => (
              <Field
                className="flex-1"
                data-invalid={field.state.meta.errors.length > 0}
              >
                <FieldLabel>{t("settings.priceDigits")}</FieldLabel>
                <div className="overflow-x-auto">
                  <ToggleGroup
                    multiple
                    variant="outline"
                    spacing={0}
                    className="w-max lg:w-full"
                    // base-ui Toggle only accepts string values; convert at the boundary and keep number state internally.
                    value={field.state.value.map(String)}
                    onValueChange={(v) => field.handleChange(v.map(Number))}
                    aria-label={t("settings.aDigitsOf", { label })}
                  >
                    {DIGITS.map((d) => (
                      <ToggleGroupItem
                        key={d}
                        value={String(d)}
                        aria-label={t("settings.aDigit", { digit: d })}
                        className="w-9 px-0 font-mono aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:hover:bg-primary aria-pressed:hover:text-primary-foreground lg:flex-1 lg:basis-0"
                      >
                        {d}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>
        </CardContent>
      </Card>
    )
  }

  // Built-in $1 filler item: only the display name is editable; no delete, no digit toggles.
  const bagCard = (
    <Card size="sm" className="relative shrink-0 rounded-md">
      <CardContent className="flex gap-3">
        <form.Field name="bagName">
          {(field) => (
            <Field
              className="flex-1"
              data-invalid={field.state.meta.errors.length > 0}
            >
              <FieldLabel htmlFor={`${fieldId}-bag-name`}>
                {t("settings.itemName")}
              </FieldLabel>
              <Input
                id={`${fieldId}-bag-name`}
                aria-label={t("settings.aBagName")}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>
        <Field className="flex-1">
          <FieldLabel htmlFor={`${fieldId}-bag-price`}>
            {t("settings.price")}
          </FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <InputGroupText>$</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              id={`${fieldId}-bag-price`}
              value={t("settings.bagPriceFixed")}
              disabled
              readOnly
              className="font-mono"
            />
          </InputGroup>
        </Field>
      </CardContent>
    </Card>
  )

  const formFields = (
    <form.Field name="items" mode="array">
      {(itemsField) => (
        <>
          {bagCard}
          {itemsField.state.value.map((_, index) =>
            renderItem(
              index,
              () => itemsField.removeValue(index),
              itemsField.state.value.length > 1,
            ),
          )}
          <Button
            variant="outline"
            className="shrink-0 border-dashed"
            disabled={itemsField.state.value.length >= MAX_ITEMS}
            onClick={() => itemsField.pushValue(NEW_ITEM)}
          >
            <PlusIcon aria-hidden="true" />
            {/* Count includes the built-in plastic bag: custom items + 1 over the total cap. */}
            {t("settings.addItem")} ({itemsField.state.value.length + 1}/
            {MAX_ITEMS + 1})
          </Button>
        </>
      )}
    </form.Field>
  )

  const body = (
    <div className="flex flex-col gap-4 overflow-y-auto p-6 max-lg:max-h-none lg:max-h-[50vh]">
      {formFields}
    </div>
  )

  const desktopFooter = (
    <AlertDialogFooter className="px-6 py-4 sm:justify-between">
      <Button
        variant="ghost"
        className="text-destructive text-xs"
        onClick={() => {
          // Close settings first so only the reset confirmation dialog is open at once.
          setOpen(false)
          setConfirmReset(true)
        }}
      >
        {t("settings.reset")}
      </Button>
      <div className="flex gap-4">
        <AlertDialogCancel variant="ghost" className="text-xs">
          {t("settings.cancel")}
        </AlertDialogCancel>
        <Button
          className="min-w-24 text-xs"
          onClick={() => form.handleSubmit()}
        >
          <CheckIcon className="size-3" aria-hidden="true" />
          {t("settings.save")}
        </Button>
      </div>
    </AlertDialogFooter>
  )

  const mobileFooter = (
    <DrawerFooter>
      <Button onClick={() => form.handleSubmit()}>
        <CheckIcon className="size-3" aria-hidden="true" />
        {t("settings.save")}
      </Button>
      {/* dismissible={false} blocks DrawerClose, so close via state directly. */}
      <Button variant="outline" onClick={() => setOpen(false)}>
        {t("settings.cancel")}
      </Button>
    </DrawerFooter>
  )

  const doReset = () => {
    setItems(DEFAULT_ITEMS)
    setBagName(DEFAULT_BAG_NAME)
    form.reset({ items: DEFAULT_ITEMS, bagName: DEFAULT_BAG_NAME })
    setConfirmReset(false)
  }

  const mobileResetConfirm = (
    <Drawer
      open={confirmReset}
      onOpenChange={setConfirmReset}
      dismissible={false}
    >
      <DrawerContent className="text-left">
        <DrawerHeader className="text-left">
          <DrawerTitle>{t("settings.resetConfirmTitle")}</DrawerTitle>
          <DrawerDescription>
            {t("settings.resetConfirmDesc")}
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <Button variant="destructive" onClick={doReset}>
            {t("settings.reset")}
          </Button>
          {/* dismissible={false} blocks DrawerClose, so close via state directly. */}
          <Button variant="outline" onClick={() => setConfirmReset(false)}>
            {t("settings.cancel")}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )

  const resetConfirm = (
    <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("settings.resetConfirmTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("settings.resetConfirmDesc")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("settings.cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={doReset}>
            {t("settings.reset")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

  if (isMobile) {
    return (
      <>
        <Drawer open={open} onOpenChange={handleOpenChange} dismissible={false}>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              aria-label={t("settings.title")}
            >
              <GearIcon aria-hidden="true" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[80vh] text-left">
            <DrawerHeader className="text-left">
              <DrawerTitle>{t("settings.title")}</DrawerTitle>
              <DrawerDescription>{t("settings.desc")}</DrawerDescription>
            </DrawerHeader>
            <div className="flex flex-col gap-4 overflow-y-auto px-4 py-1">
              {formFields}
              <Button
                variant="ghost"
                className="shrink-0 text-destructive text-xs"
                onClick={() => {
                  // Close the settings drawer first so only one drawer is open at once.
                  setOpen(false)
                  setConfirmReset(true)
                }}
              >
                {t("settings.reset")}
              </Button>
            </div>
            {mobileFooter}
          </DrawerContent>
        </Drawer>
        {mobileResetConfirm}
      </>
    )
  }

  return (
    <>
      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogTrigger
          render={
            <Button
              variant="outline"
              size="icon"
              aria-label={t("settings.title")}
            >
              <GearIcon aria-hidden="true" />
            </Button>
          }
        />
        <AlertDialogContent className="gap-4 p-0 text-left sm:max-w-md">
          <AlertDialogHeader className="px-6 py-4">
            <AlertDialogTitle className="text-base">
              {t("settings.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("settings.desc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {body}
          <div className="border-t">{desktopFooter}</div>
        </AlertDialogContent>
      </AlertDialog>
      {resetConfirm}
    </>
  )
}
