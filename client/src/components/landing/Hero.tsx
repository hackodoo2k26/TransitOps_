import { motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Route,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Container } from "../ui/Container";
import { Section } from "../ui/Section";
import { fadeUp, staggerChildren } from "../../lib/motion";

interface Metric {
  Icon: LucideIcon;
  change: string;
  label: string;
  trend: "up" | "down";
  value: string;
}

const metrics: Metric[] = [
  {
    Icon: Truck,
    change: "12%",
    label: "Active Vehicles",
    trend: "up",
    value: "1,247",
  },
  {
    Icon: Route,
    change: "6%",
    label: "Active Trips",
    trend: "up",
    value: "486",
  },
  {
    Icon: Activity,
    change: "4%",
    label: "Fleet Utilization",
    trend: "up",
    value: "87.3%",
  },
  {
    Icon: AlertTriangle,
    change: "18%",
    label: "Maintenance Alerts",
    trend: "down",
    value: "12",
  },
];

export function Hero() {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const cardAnimation = reduceMotion ? undefined : { y: [0, -8, 0] };
  const cardTransition = reduceMotion
    ? undefined
    : { duration: 5.5, ease: "easeInOut" as const, repeat: Infinity };
  const hoverAnimation = reduceMotion ? undefined : { scale: 1.02 };

  return (
    <Section aria-labelledby="hero-heading" className="landing-hero">
      <video
        aria-hidden="true"
        autoPlay
        className="landing-hero__video"
        loop
        muted
        playsInline
        poster="/hero-truck-poster.jpg"
      >
        <source src="/hero-truck.mp4" type="video/mp4" />
      </video>
      <div
        aria-hidden="true"
        className="landing-hero__overlay landing-hero__overlay--dark"
      />
      <div
        aria-hidden="true"
        className="landing-hero__overlay landing-hero__overlay--gradient"
      />
      <div aria-hidden="true" className="landing-hero__glow" />

      <Container width="wide">
        <div className="landing-hero__content">
          <motion.div
            animate="visible"
            className="landing-hero__copy"
            initial="hidden"
            variants={staggerChildren}
          >
            <motion.p className="landing-hero__eyebrow" variants={fadeUp}>
              Smart transport operations platform
            </motion.p>
            <motion.h1 id="hero-heading" variants={fadeUp}>
              Transforming
              <br />
              Supply Chain
              <br />
              Operations
            </motion.h1>
            <motion.p className="landing-hero__description" variants={fadeUp}>
              Bring real-time fleet visibility, intelligent dispatching,
              maintenance tracking, operational analytics, and AI-powered
              decision making into one calm, connected command center.
            </motion.p>
            <motion.div className="landing-hero__actions" variants={fadeUp}>
              <motion.div whileHover={hoverAnimation}>
                <Button onClick={() => navigate("/dashboard")}>
                  Open Dashboard
                </Button>
              </motion.div>
              <motion.div whileHover={hoverAnimation}>
                <Button variant="outline">Watch Demo</Button>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            animate={cardAnimation}
            className="landing-hero__overview"
            transition={cardTransition}
          >
            <Card variant="glass">
              <div className="landing-hero__overview-header">
                <div>
                  <p className="landing-hero__overview-kicker">
                    Operations intelligence
                  </p>
                  <h2>Real-time Fleet Overview</h2>
                </div>
                <span className="landing-hero__live">
                  <i aria-hidden="true" />
                  Live
                </span>
              </div>
              <div className="landing-hero__metrics">
                {metrics.map(({ Icon, change, label, trend, value }) => (
                  <div className="landing-hero__metric" key={label}>
                    <span className="landing-hero__metric-icon">
                      <Icon aria-hidden="true" size={17} />
                    </span>
                    <div>
                      <p>{label}</p>
                      <strong>{value}</strong>
                    </div>
                    <span
                      className={`landing-hero__trend landing-hero__trend--${trend}`}
                    >
                      {trend === "up" ? "↑" : "↓"} {change}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
}
