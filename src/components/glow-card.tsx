import { motion, useAnimationControls, useReducedMotion } from "motion/react"
import { useEffect, useRef } from "react"

// Wraps a result card and flashes a glowing ring around it when its contents
// change in place (shuffle / strategy switch). The flash runs in lockstep with
// the RollNumber roll-up: same start, same end, signalling "price updated".
//
// The glow is a separate absolutely-positioned overlay whose opacity is
// animated. boxShadow strings (and color-mix) don't interpolate smoothly in
// motion, so animating a plain opacity is what gives a real fade in/out.
const ROLL_DURATION = 0.4 // keep in sync with RollNumber

export function GlowCard({
  signature,
  children,
}: {
  signature: string
  children: React.ReactNode
}) {
  const reduce = useReducedMotion()
  const controls = useAnimationControls()
  const prev = useRef(signature)

  useEffect(() => {
    if (prev.current === signature) return // skip first mount
    prev.current = signature
    if (reduce) return
    controls.start({
      opacity: [0, 1, 0],
      transition: {
        // Start and end together with the roll-up.
        duration: ROLL_DURATION,
        times: [0, 0.4, 1],
        ease: ["easeOut", "easeInOut"],
      },
    })
  }, [signature, reduce, controls])

  return (
    <div className="relative flex w-full lg:w-auto">
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={controls}
        className="pointer-events-none absolute inset-0 rounded-md shadow-[0_0_6px_1px_color-mix(in_srgb,var(--ring)_40%,transparent)] ring-2 ring-ring/40"
      />
      {children}
    </div>
  )
}
