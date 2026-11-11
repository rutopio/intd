import { motionTransitions } from "@rutopio/ui/motion-tokens";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AmountInWords } from "@/components/amount-in-words";
import { AmountInput } from "@/components/amount-input";
import { CopyDialog } from "@/components/copy-dialog";
import { EmptyResults } from "@/components/empty-results";
import { ResultTableCard } from "@/components/result-table-card";
import { SettingsDialog } from "@/components/settings-dialog";
import { ShareButton } from "@/components/share-button";
import { ShuffleButton } from "@/components/shuffle-button";
import { StrategySelector } from "@/components/strategy-selector";
import { useDecomposition } from "@/hooks/use-decomposition";

// Shared home page, rendered by both the zh (/) and en (/en) routes. Language is
// read from the path via useLang; search params are read route-agnostically.
export function App() {
  const reduce = useReducedMotion();
  const {
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
    resultToCopy,
    setResultToCopy,
    handleAmountChange,
    handleSubmit,
    handleSortModeChange,
    handleShuffle,
  } = useDecomposition();

  return (
    <main className="flex w-full min-w-0 flex-1 flex-col items-center justify-center gap-6 py-6 sm:py-12 lg:w-[calc(100vw-3rem)] lg:max-w-5xl lg:self-center">
      <h1 className="sr-only">Integer Decomposition Calculator</h1>
      <div className="flex w-full flex-col gap-3 lg:max-w-md">
        <div className="flex w-full items-start justify-center gap-2">
          <AmountInput
            amount={amount}
            error={error}
            onChange={handleAmountChange}
            onSubmit={handleSubmit}
          />
          <SettingsDialog />
          <ShareButton />
        </div>

        <StrategySelector sortMode={sortMode} onChange={handleSortModeChange} />
      </div>

      <motion.div
        layout={!reduce}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="flex min-h-[26rem] w-full flex-col items-center gap-6"
      >
        {safeResults !== null &&
          (safeResults.length === 0 ? (
            <EmptyResults />
          ) : (
            <>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={runId}
                  className="flex w-full flex-col items-stretch justify-center gap-4 lg:w-auto lg:flex-row"
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -8 }}
                  transition={motionTransitions.content}
                >
                  {safeResults.map((result, idx) => (
                    <ResultTableCard
                      // Stable by position so shuffle updates content in place (no remount/enter).
                      // biome-ignore lint/suspicious/noArrayIndexKey: position is the stable identity here
                      key={idx}
                      result={result}
                      position={offset + idx + 1}
                      nameColCh={nameColCh}
                      bagName={bagName}
                      onCopy={() => setResultToCopy(result)}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>
              <motion.div
                layout={!reduce}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex w-full justify-center"
              >
                <ShuffleButton
                  spin={spin}
                  disabled={results === null}
                  onClick={handleShuffle}
                />
              </motion.div>
              {/* Chinese uppercase amount block: a zh-only convention, hidden in English. */}
              {!isEn && safeResults[0] && (
                <AmountInWords
                  total={safeResults[0].total}
                  runId={runId}
                  reduce={!!reduce}
                />
              )}
            </>
          ))}
      </motion.div>

      <CopyDialog result={resultToCopy} onClose={() => setResultToCopy(null)} />
    </main>
  );
}
