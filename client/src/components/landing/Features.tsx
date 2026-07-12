import { motion, useReducedMotion } from 'framer-motion'
import { BarChart3, Fuel, Route, Truck, UserRound, Wrench, type LucideIcon } from 'lucide-react'

import { Card } from '../ui/Card'
import { Container } from '../ui/Container'
import { Section } from '../ui/Section'
import { fadeUp, staggerChildren } from '../../lib/motion'

interface Feature {
  Icon: LucideIcon
  description: string
  id: string
  title: string
}

const features: Feature[] = [
  {
    Icon: Truck,
    id: 'fleet-management',
    title: 'Fleet Management',
    description: 'Manage vehicles, availability, lifecycle, capacity, and operational status from one place.',
  },
  {
    Icon: UserRound,
    id: 'driver-management',
    title: 'Driver Management',
    description: 'Track drivers, licenses, safety scores, availability, and compliance.',
  },
  {
    Icon: Route,
    id: 'trip-management',
    title: 'Trip Management',
    description: 'Plan, dispatch, monitor, and complete trips with automatic validation.',
  },
  {
    Icon: Wrench,
    id: 'maintenance',
    title: 'Maintenance',
    description: 'Keep vehicles healthy with scheduled servicing and maintenance tracking.',
  },
  {
    Icon: Fuel,
    id: 'fuel-expenses',
    title: 'Fuel & Expenses',
    description: 'Track fuel usage, operational expenses, and maintenance costs.',
  },
  {
    Icon: BarChart3,
    id: 'analytics-reports',
    title: 'Analytics & Reports',
    description: 'Monitor fleet utilization, ROI, operational costs, and performance metrics.',
  },
]

export function Features() {
  const reduceMotion = useReducedMotion()
  const revealProps = reduceMotion
    ? { initial: false }
    : {
        initial: 'hidden' as const,
        viewport: { amount: 0.18, once: true },
        whileInView: 'visible' as const,
      }

  return (
    <Section aria-labelledby="features-heading" className="landing-features" id="features">
      <div aria-hidden="true" className="landing-features__glow landing-features__glow--left" />
      <div aria-hidden="true" className="landing-features__glow landing-features__glow--right" />

      <Container width="wide">
        <motion.div
          {...revealProps}
          animate={reduceMotion ? 'visible' : undefined}
          className="landing-features__intro"
          variants={staggerChildren}
        >
          <motion.p className="landing-features__eyebrow" variants={fadeUp}>
            Powerful features
          </motion.p>
          <motion.h2 id="features-heading" variants={fadeUp}>
            Everything you need to manage your transport operations
          </motion.h2>
          <motion.p className="landing-features__description" variants={fadeUp}>
            TransitOps centralizes fleet, drivers, dispatch, maintenance, expenses, and operational analytics into one
            intelligent platform.
          </motion.p>
        </motion.div>

        <motion.ul
          {...revealProps}
          animate={reduceMotion ? 'visible' : undefined}
          aria-label="Platform capabilities"
          className="landing-features__grid"
          variants={staggerChildren}
        >
          {features.map(({ Icon, description, id, title }) => (
            <motion.li className="landing-features__item" key={id} variants={fadeUp}>
              <Card aria-labelledby={`feature-${id}-title`} className="landing-features__card" variant="glass">
                <span aria-hidden="true" className="landing-features__icon">
                  <Icon size={23} />
                </span>
                <h3 id={`feature-${id}-title`}>{title}</h3>
                <p>{description}</p>
              </Card>
            </motion.li>
          ))}
        </motion.ul>
      </Container>
    </Section>
  )
}
