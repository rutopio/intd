import { ArrowsClockwiseIcon } from "@phosphor-icons/react"
import { motion } from "motion/react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"

export function ShuffleButton({
  spin,
  disabled,
  onClick,
}: {
  spin: number
  disabled: boolean
  onClick: () => void
}) {
  const { t } = useTranslation()
  return (
    <Button
      variant="outline"
      disabled={disabled}
      onClick={onClick}
      className="w-full lg:w-auto"
    >
      <motion.span
        key={spin}
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="inline-flex"
      >
        <ArrowsClockwiseIcon aria-hidden="true" />
      </motion.span>
      {t("home.shuffle")}
    </Button>
  )
}
