import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react"
import { useEffect } from "react"
import { fmt } from "@/lib/rows"

// Animates an integer to a new value by rolling (tweening) the displayed number,
// formatted the same way as the static cells. Used when shuffling keeps the cards
// in place but their quantities/prices change.
export function RollNumber({
  value,
  prefix = "",
}: {
  value: number
  prefix?: string
}) {
  const reduce = useReducedMotion()
  const mv = useMotionValue(value)
  const text = useTransform(mv, (v) => `${prefix}${fmt(Math.round(v))}`)

  useEffect(() => {
    if (reduce) {
      mv.set(value)
      return
    }
    const controls = animate(mv, value, {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    })
    return () => controls.stop()
  }, [value, reduce, mv])

  return <motion.span>{text}</motion.span>
}
