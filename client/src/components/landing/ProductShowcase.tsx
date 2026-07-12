import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { Section } from '../ui/Section'
import { Badge } from '../ui/Badge'

export function ProductShowcase() {
  const reduceMotion = useReducedMotion()

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: reduceMotion ? 0 : 20 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    },
  }

  const videoVariants: Variants = {
    hidden: { 
      opacity: 0, 
      scale: reduceMotion ? 1 : 0.98,
      y: reduceMotion ? 0 : 15
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    },
  }

  return (
    <Section className="landing-showcase" aria-labelledby="showcase-heading">
      <motion.div
        className="landing-showcase__container"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={containerVariants}
      >
        <motion.div className="landing-showcase__header" variants={itemVariants}>
          <span className="landing-showcase__eyebrow">MODERN TRANSPORT OPERATIONS</span>
          <h2 id="showcase-heading" className="landing-showcase__title">
            Built for the Future of Logistics
          </h2>
          <p className="landing-showcase__description">
            TransitOps delivers intelligent fleet operations, dispatch automation, real-time visibility, predictive maintenance, and operational excellence.
          </p>
        </motion.div>

        <motion.div 
          className="landing-showcase__frame" 
          variants={videoVariants}
        >
          <video
            className="landing-showcase__video"
            src="/cargo_animation.mp4"
            autoPlay
            muted
            loop
            playsInline
          />
        </motion.div>

        <motion.div className="landing-showcase__badges" variants={itemVariants}>
          <Badge variant="accent" className="landing-showcase__badge">✓ AI Dispatch</Badge>
          <Badge variant="accent" className="landing-showcase__badge">✓ Real-Time Fleet Tracking</Badge>
          <Badge variant="accent" className="landing-showcase__badge">✓ Predictive Maintenance</Badge>
        </motion.div>
      </motion.div>
    </Section>
  )
}
