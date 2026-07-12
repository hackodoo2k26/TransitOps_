import type { Variants } from 'framer-motion'

export const fadeIn: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.22 } } }
export const fadeUp: Variants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } }
export const scaleIn: Variants = { hidden: { opacity: 0, scale: 0.96 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.24 } } }
export const staggerChildren: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } } }
export const pageTransition: Variants = { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }, exit: { opacity: 0, y: -8, transition: { duration: 0.18 } } }
