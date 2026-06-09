import type { TFunction } from "i18next"
import { z } from "zod"
import { MAX_AMOUNT, MAX_ITEMS } from "@/lib/constants"

export function createAmountSchema(t: (key: string) => string) {
  return z.coerce
    .number({ message: t("home.errRequired") })
    .int(t("home.errInt"))
    .positive(t("home.errPositive"))
    .max(MAX_AMOUNT, t("home.errMax"))
}

export const searchSchema = z.object({
  p: z.coerce
    .number()
    .int()
    .positive()
    .max(MAX_AMOUNT)
    .optional()
    .catch(undefined),
})

const segmenter = new Intl.Segmenter("zh", { granularity: "grapheme" })
const graphemeCount = (s: string) => [...segmenter.segment(s)].length

export function createSettingsSchema(t: TFunction) {
  const rangeSchema = z
    .object({
      name: z
        .string()
        .trim()
        .min(1, t("settings.errName"))
        .refine((s) => graphemeCount(s) <= 10, t("settings.errNameMax")),
      min: z
        .number()
        .int()
        .min(1, t("settings.errPosInt"))
        .max(MAX_AMOUNT, t("settings.errMaxLimit", { max: MAX_AMOUNT })),
      max: z
        .number()
        .int()
        .min(1, t("settings.errPosInt"))
        .max(MAX_AMOUNT, t("settings.errMaxLimit", { max: MAX_AMOUNT })),
      digits: z.array(z.number()).min(1, t("settings.errDigitMin")),
    })
    .refine((d) => d.max >= d.min, {
      message: t("settings.errMaxGteMin"),
      path: ["max"],
    })

  return z.object({
    bagName: z
      .string()
      .trim()
      .min(1, t("settings.errName"))
      .refine((s) => graphemeCount(s) <= 10, t("settings.errNameMax")),
    items: z
      .array(rangeSchema)
      .min(1, t("settings.errAtLeastOne"))
      .max(MAX_ITEMS, t("settings.errAtMost", { max: MAX_ITEMS })),
  })
}
