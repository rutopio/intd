import { AnimatePresence, motion, useReducedMotion } from "motion/react";

// Wraps a result card and flashes a glowing ring around it when its contents
// change in place (shuffle / strategy switch). The flash runs in lockstep with
// the RollNumber roll-up: same start, same end, signalling "price updated".
//
// The glow is a separate absolutely-positioned overlay whose opacity is
// animated. boxShadow strings (and color-mix) don't interpolate smoothly in
// motion, so animating a plain opacity is what gives a real fade in/out.
const ROLL_DURATION = 0.4; // keep in sync with RollNumber

export function GlowCard({
  signature,
  children,
}: {
  signature: string;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();

  return (
    <div className="relative flex w-full lg:w-auto">
      <AnimatePresence initial={false}>
        <motion.div
          key={signature}
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={reduce ? { opacity: 0 } : { opacity: [0, 1, 0] }}
          transition={{
            duration: reduce ? 0 : ROLL_DURATION,
            times: [0, 0.4, 1],
            ease: ["easeOut", "easeInOut"],
          }}
          className="ring-ring/40 pointer-events-none absolute inset-0 rounded-md shadow-[0_0_6px_1px_color-mix(in_srgb,var(--ring)_40%,transparent)] ring-2"
        />
      </AnimatePresence>
      {children}
    </div>
  );
}
