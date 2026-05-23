import { motion } from 'framer-motion';
import {
  ArrowRight,
  Brain,
  CalendarDays,
  FileText,
  LineChart,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '../components/common/Button.jsx';
import { Card } from '../components/common/Card.jsx';
import { APP_NAME, ROUTES } from '../constants/app.js';
import { pageFadeRise, staggerContainer, staggerItem } from '../services/motions.js';
import { useAuthStore } from '../store/authStore.js';

const FEATURES = [
  {
    icon: CalendarDays,
    title: 'Symptom timeline',
    description: 'Every entry, severity, mood, and trigger captured in a fast, searchable chronological view.',
  },
  {
    icon: Brain,
    title: 'Insights engine',
    description: 'Surface correlations, severity trends, and day-of-week patterns automatically.',
  },
  {
    icon: Sparkles,
    title: 'AI narratives',
    description: 'AI turns your log into a doctor-ready clinical summary in seconds.',
  },
  {
    icon: FileText,
    title: 'Clinical PDFs',
    description: 'Download a clinician-formatted PDF report with charts, triggers, and AI summaries.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure by design',
    description: 'Encrypted at rest and in transit. Strict auth, audit-friendly.',
  },
  {
    icon: LineChart,
    title: 'Visual analytics',
    description: 'Beautiful, theme-aware charts for severity, trigger frequency, and progression.',
  },
];

export const LandingPage = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-surface-grad"
      />

      <section className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-12 text-center sm:px-6 md:px-8 md:py-20">
        <motion.span
          className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary-strong"
          {...pageFadeRise}
        >
          <Sparkles aria-hidden="true" size={12} /> {APP_NAME} · AI-Powered Symptom Intelligence
        </motion.span>
        <motion.h1
          className="mt-5 max-w-3xl text-[32px] font-semibold tracking-tight text-text sm:text-4xl md:text-5xl lg:text-[56px] lg:leading-[1.05]"
          {...pageFadeRise}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
        >
          Your clinical narrative, <span className="ai-text-gradient">unified.</span>
        </motion.h1>
        <motion.p
          className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted md:text-base"
          {...pageFadeRise}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          {APP_NAME} is a clinical narrative platform for AI-powered symptom intelligence. Track
          symptoms, surface patterns, and generate doctor-ready summaries in a fast,
          premium workspace built for healthcare.
        </motion.p>
        <motion.div
          className="mt-7 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3"
          {...pageFadeRise}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        >
          {isAuthenticated ? (
            <Button as={Link} iconRight={ArrowRight} size="lg" to={ROUTES.DASHBOARD} variant="ai">
              Open Dashboard
            </Button>
          ) : (
            <Button as={Link} iconRight={ArrowRight} size="lg" to={ROUTES.SIGNUP} variant="ai">
              Get started — it&rsquo;s free
            </Button>
          )}
          <Button as={Link} size="lg" to={ROUTES.ABOUT} variant="secondary">
            Learn more
          </Button>
        </motion.div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 md:px-8 md:pb-16">
        <div className="mb-8 text-center">
          <p className="text-2xs font-semibold uppercase tracking-[0.14em] text-primary">
            Built for patients &amp; clinicians
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-text sm:text-2xl md:text-[28px]">
            Everything you need to tell your story
          </h2>
        </div>

        <motion.div
          animate="animate"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          initial="initial"
          variants={staggerContainer}
          viewport={{ once: true, amount: 0.2 }}
          whileInView="animate"
        >
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.title} variants={staggerItem}>
                <Card className="h-full" interactive>
                  <Card.Pad padding="sm" className="flex flex-col gap-2.5">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Icon aria-hidden="true" size={16} />
                    </span>
                    <h3 className="m-0 text-[15px] font-semibold tracking-tight text-text">
                      {feature.title}
                    </h3>
                    <p className="m-0 text-[13px] leading-relaxed text-muted">{feature.description}</p>
                  </Card.Pad>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 md:px-8">
        <div className="rounded-2xl border border-border bg-surface px-5 py-8 text-center shadow-soft sm:px-8 md:px-10 md:py-12">
          <Stethoscope aria-hidden="true" className="mx-auto mb-3 text-primary" size={26} />
          <h2 className="text-lg font-semibold text-text md:text-xl">
            Start tracking in under a minute
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
            Free to use. No card required. Bring your symptoms, leave with a story your clinician
            can act on.
          </p>
          <div className="mt-5 flex justify-center">
            {isAuthenticated ? (
              <Button as={Link} iconRight={ArrowRight} to={ROUTES.DASHBOARD} variant="ai">
                Open Dashboard
              </Button>
            ) : (
              <Button as={Link} iconRight={ArrowRight} to={ROUTES.SIGNUP} variant="ai">
                Create your account
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
