import { XCircleIcon } from "@phosphor-icons/react"
import { motion, useReducedMotion } from "motion/react"
import { useTranslation } from "react-i18next"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export function EmptyResults() {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <XCircleIcon aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>{t("home.emptyTitle")}</EmptyTitle>
          <EmptyDescription>{t("home.emptyDesc")}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </motion.div>
  )
}
