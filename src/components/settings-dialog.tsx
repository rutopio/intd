import { CheckIcon, GearIcon, PlusIcon, XIcon } from "@phosphor-icons/react"
import { useForm } from "@tanstack/react-form"
import { useId, useState } from "react"
import { z } from "zod"
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
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { DEFAULT_ITEMS, useSettings } from "@/hooks/use-settings"
import type { ItemConfig } from "@/lib/decompose"

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]

const NEW_ITEM: ItemConfig = { name: "", min: 1, max: 100, digits: [0, 5] }

const rangeSchema = z
  .object({
    name: z.string().trim().min(1, "請輸入品名"),
    min: z.number().int().min(1, "需為正整數"),
    max: z.number().int().min(1, "需為正整數"),
    digits: z.array(z.number()).min(1, "至少選一個尾數"),
  })
  .refine((d) => d.min <= d.max, {
    message: "最小值需小於等於最大值",
    path: ["max"],
  })

const settingsSchema = z.object({
  items: z.array(rangeSchema).min(1, "至少需一個品項"),
})

const numInputClass =
  "flex-1 [-moz-appearance:_textfield] focus:z-10 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"

export function SettingsDialog() {
  const { items, setItems } = useSettings()
  const [open, setOpen] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const fieldId = useId()

  const form = useForm({
    defaultValues: { items },
    validators: { onSubmit: settingsSchema },
    onSubmit: ({ value }) => {
      setItems(value.items)
      setOpen(false)
    },
  })

  const handleOpenChange = (next: boolean) => {
    if (next) form.reset({ items })
    setOpen(next)
  }

  const renderItem = (
    index: number,
    onRemove: () => void,
    canRemove: boolean,
  ) => {
    const label = `品項 ${index + 1}`
    return (
      <Card size="sm" className="relative shrink-0">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`刪除${label}`}
          disabled={!canRemove}
          onClick={onRemove}
          className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
        >
          <XIcon />
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
                    品名
                  </FieldLabel>
                  <Input
                    id={`${fieldId}-${index}-name`}
                    aria-label={`${label} 品名`}
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
                    價格區間
                  </FieldLabel>
                  <div className="flex">
                    <form.Field name={`items[${index}].min`}>
                      {(minField) => (
                        <Input
                          aria-label={`${label} 最小值`}
                          className={`${numInputClass} rounded-e-none`}
                          id={`${fieldId}-${index}-min`}
                          placeholder="價格下限"
                          type="number"
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
                      )}
                    </form.Field>
                    <Input
                      aria-label={`${label} 最大值`}
                      className={`${numInputClass} -ms-px rounded-s-none`}
                      placeholder="價格上限"
                      type="number"
                      value={maxField.state.value || ""}
                      onBlur={maxField.handleBlur}
                      onChange={(e) =>
                        maxField.handleChange(
                          e.target.value === "" ? 0 : Number(e.target.value),
                        )
                      }
                    />
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
                <FieldLabel>可用尾數</FieldLabel>
                <ToggleGroup
                  multiple
                  variant="outline"
                  spacing={0}
                  value={field.state.value.map(String)}
                  onValueChange={(v) => field.handleChange(v.map(Number))}
                  aria-label={`${label}可用尾數`}
                >
                  {DIGITS.map((d) => (
                    <ToggleGroupItem
                      key={d}
                      value={String(d)}
                      aria-label={`尾數 ${d}`}
                      className="w-9 aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:hover:bg-primary aria-pressed:hover:text-primary-foreground"
                    >
                      {d}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>
        </CardContent>
      </Card>
    )
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger
        render={
          <Button variant="outline" size="icon" aria-label="設定">
            <GearIcon />
          </Button>
        }
      />
      <AlertDialogContent className="gap-4 text-left sm:max-w-md">
        <AlertDialogTitle className="font-heading font-medium leading-none">
          設定
        </AlertDialogTitle>

        <div className="-mx-6 flex max-h-[50vh] flex-col gap-4 overflow-y-auto px-6 py-1">
          <form.Field name="items" mode="array">
            {(itemsField) => (
              <>
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
                  onClick={() => itemsField.pushValue(NEW_ITEM)}
                >
                  <PlusIcon aria-hidden="true" />
                  新增品項
                </Button>
              </>
            )}
          </form.Field>
        </div>

        <div className="-mx-6 -mb-6 flex items-center rounded-b-xl border-t bg-muted/50 px-6 py-4">
          <Button
            variant="ghost"
            className="text-destructive text-xs"
            onClick={() => setConfirmReset(true)}
          >
            重設
          </Button>
          <div className="ml-auto flex gap-4">
            <AlertDialogCancel variant="ghost" className="text-xs">
              取消
            </AlertDialogCancel>
            <Button
              className="min-w-24 text-xs"
              onClick={() => form.handleSubmit()}
            >
              <CheckIcon className="size-3" aria-hidden="true" />
              儲存
            </Button>
          </div>
        </div>

        <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>確定重設？</AlertDialogTitle>
              <AlertDialogDescription>
                將還原所有品項為預設值，此操作無法復原。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  form.reset({ items: DEFAULT_ITEMS })
                  setConfirmReset(false)
                }}
              >
                重設
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AlertDialogContent>
    </AlertDialog>
  )
}
