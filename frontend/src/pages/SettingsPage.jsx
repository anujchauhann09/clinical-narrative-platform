import { motion } from 'framer-motion';
import { ChevronRight, Monitor, Moon, Sun, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge } from '../components/common/Badge.jsx';
import { Card } from '../components/common/Card.jsx';
import { Container, PageHeader } from '../components/layout/PageHeader.jsx';
import { ROUTES } from '../constants/app.js';
import { useTheme } from '../hooks/useTheme.js';
import { pageFadeRise } from '../services/motions.js';
import { THEME_OPTIONS } from '../store/themeStore.js';
import { useAuthStore } from '../store/authStore.js';
import { cn } from '../utils/cn.js';

const THEME_CHOICES = [
  {
    value: THEME_OPTIONS.LIGHT,
    label: 'Light',
    description: 'Bright surfaces for daytime clinical review.',
    icon: Sun,
  },
  {
    value: THEME_OPTIONS.SYSTEM,
    label: 'System',
    description: 'Match your operating system preference.',
    icon: Monitor,
  },
  {
    value: THEME_OPTIONS.DARK,
    label: 'Dark',
    description: 'Lower glare for late-night journaling.',
    icon: Moon,
  },
];

export const SettingsPage = () => {
  const { mode, setMode } = useTheme();
  const user = useAuthStore((state) => state.user);

  return (
    <Container maxWidth="5xl">
      <motion.div className="flex flex-col gap-5 md:gap-6" {...pageFadeRise}>
        <PageHeader
          description="Tune the look of the app and review what's tied to your account."
          eyebrow="Account"
          title="Settings"
        />

        <Card>
          <Card.Header>
            <div>
              <Card.Title>Appearance</Card.Title>
              <Card.Subtitle>Switch between light, dark, or follow your system.</Card.Subtitle>
            </div>
          </Card.Header>
          <Card.Body>
            <div
              aria-label="Theme"
              className="grid gap-3 sm:grid-cols-3"
              role="radiogroup"
            >
              {THEME_CHOICES.map((choice) => {
                const Icon = choice.icon;
                const isActive = mode === choice.value;
                return (
                  <button
                    aria-checked={isActive}
                    className={cn(
                      'flex flex-col items-start gap-2 rounded-2xl border bg-surface p-4 text-left shadow-soft transition-all duration-150 ease-smooth',
                      'hover:-translate-y-0.5 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                      isActive
                        ? 'border-primary ring-2 ring-primary/30'
                        : 'border-border',
                    )}
                    key={choice.value}
                    onClick={() => setMode(choice.value)}
                    role="radio"
                    type="button"
                  >
                    <span
                      className={cn(
                        'grid h-9 w-9 place-items-center rounded-xl',
                        isActive
                          ? 'bg-primary text-primary-contrast'
                          : 'bg-primary/10 text-primary',
                      )}
                    >
                      <Icon aria-hidden="true" size={18} />
                    </span>
                    <span className="text-sm font-semibold text-text">{choice.label}</span>
                    <span className="text-xs text-muted">{choice.description}</span>
                    {isActive ? (
                      <Badge className="mt-1" tone="success">
                        Active
                      </Badge>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <div>
              <Card.Title>Account</Card.Title>
              <Card.Subtitle>Information captured at signup.</Card.Subtitle>
            </div>
          </Card.Header>
          <Card.Body className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted">Email</span>
              <span className="truncate text-sm font-medium text-text">{user?.email ?? '—'}</span>
            </div>
            <Link
              className="mt-1 inline-flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-text shadow-soft transition-colors hover:bg-surface-2"
              to={ROUTES.PROFILE}
            >
              <span className="inline-flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <UserRound aria-hidden="true" size={16} />
                </span>
                Open full profile
              </span>
              <ChevronRight aria-hidden="true" className="text-muted" size={16} />
            </Link>
          </Card.Body>
        </Card>
      </motion.div>
    </Container>
  );
};
