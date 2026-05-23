import {
  Brain,
  CalendarDays,
  FileText,
  LineChart,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from 'lucide-react';

import { APP_NAME } from '../constants/app.js';

const CAPABILITIES = [
  {
    icon: CalendarDays,
    title: 'Symptom timeline',
    description:
      'Log episodes in seconds — severity, mood, triggers, notes — and view them on a fast, searchable chronological timeline.',
  },
  {
    icon: Brain,
    title: 'Insights engine',
    description:
      'Automatic correlations across triggers, severity trends, day-of-week patterns, and progression — calculated transparently, not hidden behind a model.',
  },
  {
    icon: Sparkles,
    title: 'AI clinical narratives',
    description:
      'Turn months of raw entries into a structured, doctor-ready summary that reads like a clinical note instead of a spreadsheet.',
  },
  {
    icon: FileText,
    title: 'Clinical PDF reports',
    description:
      'One-click export to a clinician-formatted PDF with charts, trigger frequency, severity progression, and the AI narrative attached.',
  },
  {
    icon: MessageSquare,
    title: 'AI copilot',
    description:
      'Ask questions about your own history in plain language. The copilot grounds every answer in your logged entries — no hallucinated history.',
  },
  {
    icon: LineChart,
    title: 'Visual analytics',
    description:
      'Theme-aware charts for severity over time, trigger frequency, and symptom mix — the same visuals that ship in the PDF.',
  },
];

const PRINCIPLES = [
  {
    icon: ShieldCheck,
    title: 'Privacy first',
    description:
      'Your data is yours. Everything you log is encrypted while it moves across the internet and while it sits in our database. Only you can see your records, and the AI features only get the smallest slice of data needed to help — never the whole picture, and never to train anyone’s model.',
  },
  {
    icon: Stethoscope,
    title: 'Built for the clinic visit',
    description:
      'Every feature exists to make the 12 minutes you get with a doctor more useful. We optimise for what survives the handoff — a narrative, a chart, a PDF — not for engagement metrics.',
  },
  {
    icon: Sparkles,
    title: 'Transparent AI',
    description:
      'The insights engine uses deterministic statistics you can verify. AI is used for language — turning structured data into prose — never to invent symptoms or diagnoses.',
  },
];

export const AboutPage = () => (
  <div className="mx-auto w-full max-w-4xl px-4 py-12 md:px-8 md:py-16">
    <p className="text-2xs font-semibold uppercase tracking-[0.14em] text-primary">About us</p>
    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text md:text-4xl">
      Your clinical narrative, unified.
    </h1>
    <p className="mt-4 text-base text-muted md:text-lg">
      {APP_NAME} is a clinical narrative platform for AI-powered symptom intelligence. We help
      patients and clinicians turn fragmented day-to-day symptom logs into a structured medical
      story — searchable, visualised, and ready for a consultation.
    </p>

    <section className="mt-12 grid gap-6 md:grid-cols-2">
      <article className="rounded-2xl border border-border bg-surface p-6 shadow-soft">
        <h2 className="m-0 text-lg font-semibold text-text">The problem we solve</h2>
        <p className="mt-2 text-sm text-muted">
          Modern medicine generates a flood of data, scattered across portals, paper notes, and
          tracking apps. By the time you sit in front of a clinician, the chronological story —
          the actual signal — is gone. Patients answer from memory; doctors decide from
          impressions; patterns hide in plain sight.
        </p>
      </article>
      <article className="rounded-2xl border border-border bg-surface p-6 shadow-soft">
        <h2 className="m-0 text-lg font-semibold text-text">What we do differently</h2>
        <p className="mt-2 text-sm text-muted">
          We pair a frictionless logging experience with a deterministic insights engine and a
          carefully scoped AI layer. The result is a record that's faithful to what actually
          happened, summarised in language a clinician can act on in under a minute.
        </p>
      </article>
    </section>

    <section className="mt-12">
      <h2 className="text-xl font-semibold tracking-tight text-text md:text-2xl">
        What {APP_NAME} offers
      </h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {CAPABILITIES.map(({ icon: Icon, title, description }) => (
          <article
            key={title}
            className="rounded-2xl border border-border bg-surface p-5 shadow-soft"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon aria-hidden="true" size={18} />
              </span>
              <h3 className="m-0 text-base font-semibold text-text">{title}</h3>
            </div>
            <p className="mt-3 text-sm text-muted">{description}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="mt-12">
      <h2 className="text-xl font-semibold tracking-tight text-text md:text-2xl">
        What we won't compromise on
      </h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {PRINCIPLES.map(({ icon: Icon, title, description }) => (
          <article
            key={title}
            className="rounded-2xl border border-border bg-surface p-5 shadow-soft"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon aria-hidden="true" size={18} />
            </span>
            <h3 className="mt-3 text-base font-semibold text-text">{title}</h3>
            <p className="mt-2 text-sm text-muted">{description}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="mt-12 rounded-2xl border border-border bg-surface p-6 shadow-soft md:p-8">
      <h2 className="m-0 text-lg font-semibold text-text">A note on scope</h2>
      <p className="mt-2 text-sm text-muted md:text-base">
        {APP_NAME} is a record-keeping and communication tool. It does not diagnose, treat, or
        replace medical advice. The narratives and charts it produces are decision aids for the
        conversation between you and a qualified clinician — nothing more, and nothing less.
      </p>
    </section>
  </div>
);
