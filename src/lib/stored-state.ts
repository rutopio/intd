import { z } from "zod";
import { MAX_AMOUNT, MAX_BAGS, MAX_ITEMS } from "./constants";
import { createSettingsSchema } from "./schema";

export const storedAmount = z.string();
export const storedTarget = z
  .number()
  .int()
  .positive()
  .max(MAX_AMOUNT)
  .nullable();
export const storedSortMode = z.enum(["bags", "balance"]);
export const storedSettings = createSettingsSchema((key) => key);

const result = z
  .object({
    lines: z
      .array(
        z.object({
          name: z.string(),
          price: z.number().int().nonnegative(),
          qty: z.number().int().nonnegative(),
        })
      )
      .min(1)
      .max(MAX_ITEMS),
    bags: z.number().int().min(0).max(MAX_BAGS),
    total: z.number().int().positive().max(MAX_AMOUNT),
    balanceScore: z.number().int().nonnegative(),
  })
  .refine(
    (value) =>
      value.lines.reduce(
        (sum, line) => sum + line.price * line.qty,
        value.bags
      ) === value.total
  );
const mode = z
  .object({
    results: z.array(result),
    seen: z.array(z.string()),
    offset: z.number().int().nonnegative(),
  })
  .nullable();
export const storedByMode = z.object({ bags: mode, balance: mode });
export type ByMode = z.infer<typeof storedByMode>;

export interface StoredValueSchema<T> {
  safeParse(value: unknown): { success: true; data: T } | { success: false };
}

/** Storage is external input, including valid JSON left by an older version. */
export function parseStoredValue<T>(
  raw: string | null,
  initial: T,
  schema: StoredValueSchema<T>
): T {
  if (raw === null) return initial;
  try {
    const result = schema.safeParse(JSON.parse(raw));
    return result.success ? result.data : initial;
  } catch {
    return initial;
  }
}
