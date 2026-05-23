import { Activity, ShieldCheck, Sparkles } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';

import { ThemeToggle } from '../components/common/ThemeToggle.jsx';
import { APP_KICKER, APP_NAME, ROUTES } from '../constants/app.js';
import { ToastProvider } from '../context/ToastContext.jsx';

const TRUST_BULLETS = [
  {
    icon: Sparkles,
    title: 'AI-assisted summaries',
    description: 'Doctor-ready narratives generated from your symptom log in seconds.',
  },
  {
    icon: ShieldCheck,
    title: 'Encrypted & private',
    description: 'Your data is yours. Encrypted at rest and in transit, never shared.',
  },
];

export const AuthLayout = () => (
  <ToastProvider>
    <div className="relative flex min-h-screen flex-col bg-bg text-text">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-surface-grad"
      />
      <header className="flex items-center justify-between px-4 py-4 sm:px-6 md:px-8">
        <Link className="flex items-center gap-3" to={ROUTES.HOME}>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-ai-grad text-white shadow-glow">
            <Activity aria-hidden="true" size={18} />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-text">{APP_NAME}</span>
            <span className="text-2xs uppercase tracking-wider text-muted">{APP_KICKER}</span>
          </span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 md:py-12">
        <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1.05fr_1fr] lg:items-center">
          <aside className="hidden flex-col gap-5 lg:flex">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary-strong">
              <Sparkles aria-hidden="true" size={12} />
              The future of medical records
            </span>
            <h2 className="m-0 text-3xl font-semibold tracking-tight text-text lg:text-[34px] lg:leading-[1.15]">
              Your clinical narrative,{' '}
              <span className="ai-text-gradient">unified.</span>
            </h2>
            <p className="m-0 max-w-md text-[15px] leading-relaxed text-muted">
              Track symptoms, surface patterns, and generate doctor-ready summaries — all in a fast,
              premium, AI-assisted workspace.
            </p>
            <ul className="m-0 mt-2 flex flex-col gap-3 p-0">
              {TRUST_BULLETS.map(({ icon: Icon, title, description }) => (
                <li className="flex items-start gap-3" key={title}>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon aria-hidden="true" size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="m-0 text-sm font-semibold text-text">{title}</p>
                    <p className="m-0 text-[13px] leading-relaxed text-muted">{description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </aside>

          <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-elevated sm:p-6 md:p-7">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  </ToastProvider>
);
