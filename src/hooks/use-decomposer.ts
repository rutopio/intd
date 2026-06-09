import { useNavigate, useSearch } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { useLang } from "@/hooks/use-lang"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useSettings } from "@/hooks/use-settings"
import {
  decompose,
  type Item,
  isItem,
  keyOf,
  type SortMode,
} from "@/lib/decompose"
import { createAmountSchema } from "@/lib/schema"
import { clearSession } from "@/lib/session"

type ModeState = { results: Item[]; seen: string[]; offset: number }
type ByMode = Record<SortMode, ModeState | null>
const EMPTY_BY_MODE: ByMode = { bags: null, balance: null }

export function useDecomposer() {
  const { t } = useTranslation()
  const lang = useLang()
  const isEn = lang === "en"
  const amountSchema = createAmountSchema(t)
  const { items, bagName } = useSettings()
  const navigate = useNavigate()
  const { p } = useSearch({ strict: false }) as { p?: number }

  const [amount, setAmount] = useLocalStorage("idc:amount", "")
  const [runId, setRunId] = useState(0)
  const [spin, setSpin] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [shareItem, setShareItem] = useState<Item | null>(null)
  const [target, setTarget] = useLocalStorage<number | null>("idc:target", null)
  const [sortMode, setSortMode] = useLocalStorage<SortMode>(
    "idc:sortMode",
    "bags",
  )
  const [byMode, setByMode] = useLocalStorage<ByMode>(
    "idc:byMode",
    EMPTY_BY_MODE,
  )

  const current = byMode[sortMode]
  const results = current?.results ?? null
  const seen = current?.seen ?? []
  const offset = current?.offset ?? 0
  const safeResults = results?.every(isItem) ? results : null
  const nameColCh =
    Math.max(...items.map((it) => it.name.length), bagName.length) + 1

  // bumpRun: true for a fresh decompose (replay enter + flip); false for strategy change (update in place).
  const runDecompose = (
    tt: number,
    mode: SortMode = sortMode,
    bumpRun = true,
  ) => {
    const picks = decompose(tt, items, undefined, mode)
    const next: ModeState = {
      results: picks,
      seen: picks.map(keyOf),
      offset: 0,
    }
    setTarget(tt)
    setByMode((prev) =>
      bumpRun ? { ...EMPTY_BY_MODE, [mode]: next } : { ...prev, [mode]: next },
    )
    if (bumpRun) setRunId((n) => n + 1)
    setSpin((n) => n + 1)
  }

  const handleSortModeChange = (mode: SortMode) => {
    setSortMode(mode)
    if (target !== null && byMode[mode] === null)
      runDecompose(target, mode, false)
    else setSpin((n) => n + 1)
  }

  const handleAmountChange = (value: string) => {
    setAmount(value)
    if (error) setError(null)
  }

  const handleSubmit = () => {
    if (amount.trim() === "") {
      clearSession()
      setError(null)
      navigate({ to: ".", search: {}, replace: true })
      toast.success(t("home.clearedToast"))
      return
    }
    const parsed = amountSchema.safeParse(amount.trim())
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      return
    }
    setError(null)
    const tt = parsed.data
    runDecompose(tt)
    navigate({ to: ".", search: { p: tt }, replace: true })
  }

  const handleShuffle = () => {
    if (target === null) return
    const seenSet = new Set(seen)
    const picks = decompose(target, items, seenSet, sortMode)
    if (picks.length === 0) return
    for (const pick of picks) seenSet.add(keyOf(pick))
    setByMode((prev) => ({
      ...prev,
      [sortMode]: {
        results: picks,
        seen: [...seenSet],
        offset: offset + (results?.length ?? 0),
      },
    }))
    setSpin((n) => n + 1)
  }

  const didInit = useRef(false)
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs once on entry, not on dependency changes
  useEffect(() => {
    if (didInit.current) return
    didInit.current = true
    if (p !== undefined) {
      setAmount(String(p))
      setError(null)
      runDecompose(p)
      return
    }
    if (target !== null) {
      navigate({ to: ".", search: { p: target }, replace: true })
    }
  }, [])

  return {
    isEn,
    amount,
    error,
    runId,
    spin,
    sortMode,
    safeResults,
    results,
    offset,
    nameColCh,
    bagName,
    shareItem,
    setShareItem,
    handleAmountChange,
    handleSubmit,
    handleSortModeChange,
    handleShuffle,
  }
}
