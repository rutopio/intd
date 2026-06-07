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
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
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
import { DEFAULT_ITEMS, useSettings } from "@/hooks/use-settings"
import type { ItemConfig } from "@/lib/decompose"

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]

const NEW_ITEM: ItemConfig = { name: "", min: 0, max: 0, digits: [] }

const segmenter = new Intl.Segmenter("zh", { granularity: "grapheme" })
const graphemeCount = (s: string) => [...segmenter.segment(s)].length

const rangeSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "請輸入品名")
      .refine((s) => graphemeCount(s) <= 10, "至多10個字"),
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
  const isMobile = useIsMobile()
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
                        <InputGroup className="rounded-e-none">
                          <InputGroupAddon>
                            <InputGroupText>$</InputGroupText>
                          </InputGroupAddon>
                          <InputGroupInput
                            aria-label={`${label} 最小值`}
                            className={numInputClass}
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
                        </InputGroup>
                      )}
                    </form.Field>
                    <InputGroup className="-ms-px rounded-s-none">
                      <InputGroupAddon>
                        <InputGroupText>$</InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        aria-label={`${label} 最大值`}
                        className={numInputClass}
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
                <FieldLabel>價格尾數</FieldLabel>
                <ToggleGroup
                  multiple
                  variant="outline"
                  spacing={0}
                  className="w-full"
                  value={field.state.value.map(String)}
                  onValueChange={(v) => field.handleChange(v.map(Number))}
                  aria-label={`${label}價格尾數`}
                >
                  {DIGITS.map((d) => (
                    <ToggleGroupItem
                      key={d}
                      value={String(d)}
                      aria-label={`尾數 ${d}`}
                      className="flex-1 shrink basis-0 px-0 aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:hover:bg-primary aria-pressed:hover:text-primary-foreground"
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

  const body = (
    <div className="-mx-6 flex flex-col gap-4 overflow-y-auto px-6 py-1 max-lg:max-h-none lg:max-h-[50vh]">
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
  )

  const desktopFooter = (
    <div className="-mx-6 -mb-6 flex items-center rounded-b-xl border-t bg-muted/50 px-6 py-4">
      <Button
        variant="ghost"
        className="text-destructive text-xs"
        onClick={() => {
          setOpen(false)
          setConfirmReset(true)
        }}
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
  )

  const mobileFooter = (
    <DrawerFooter>
      <Button onClick={() => form.handleSubmit()}>
        <CheckIcon className="size-3" aria-hidden="true" />
        儲存
      </Button>
      <DrawerClose asChild>
        <Button variant="outline">取消</Button>
      </DrawerClose>
    </DrawerFooter>
  )

  const resetConfirm = (
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
              setItems(DEFAULT_ITEMS)
              form.reset({ items: DEFAULT_ITEMS })
              setConfirmReset(false)
            }}
          >
            重設
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleOpenChange} dismissible={false}>
        <DrawerTrigger asChild>
          <Button variant="outline" size="icon" aria-label="設定">
            <GearIcon />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="gap-4 px-6 pt-2 pb-0 text-left">
          <DrawerTitle className="font-heading font-medium leading-none">
            設定
          </DrawerTitle>
          {body}
          {mobileFooter}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <>
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
          {body}
          {desktopFooter}
        </AlertDialogContent>
      </AlertDialog>
      {resetConfirm}
    </>
  )
}
