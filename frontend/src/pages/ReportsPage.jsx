import { motion } from 'framer-motion';
import {
  Activity,
  CalendarRange,
  ClipboardList,
  Download,
  FileDown,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { clinicalReportApi } from '../api/clinicalReportApi.js';
import { Badge } from '../components/common/Badge.jsx';
import { Button } from '../components/common/Button.jsx';
import { Card } from '../components/common/Card.jsx';
import { Input } from '../components/common/Input.jsx';
import { Container, PageHeader } from '../components/layout/PageHeader.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { dateService } from '../services/dateService.js';
import { pageFadeRise, staggerContainer, staggerItem } from '../services/motions.js';

const DEFAULT_WINDOW_DAYS = 60;

const SECTIONS = [
  {
    label: 'Patient summary',
    description: 'Name, contact, demographics, window-level metrics.',
    icon: ClipboardList,
  },
  {
    label: 'Symptom timeline',
    description: 'Tabular log of entries with severity, mood, symptoms, triggers, notes.',
    icon: CalendarRange,
  },
  {
    label: 'Severity charts',
    description: 'Line chart of severity across the window, plus top-trigger bar chart.',
    icon: Activity,
  },
  {
    label: 'Triggers',
    description: 'Top triggers and top symptoms ranked by frequency.',
    icon: Stethoscope,
  },
  {
    label: 'AI summary',
    description: 'Latest symptom narrative, pattern explanation, timeline, and doctor visit summary.',
    icon: Sparkles,
  },
];

export const ReportsPage = () => {
  const { showToast } = useToast();
  const todayMax = useMemo(() => dateService.todayYyyyMmDd(), []);
  const defaultFrom = useMemo(() => dateService.daysAgoYyyyMmDd(DEFAULT_WINDOW_DAYS), []);
  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(todayMax);
  const [isDownloading, setIsDownloading] = useState(false);

  const isWindowValid = !fromDate || !toDate || new Date(fromDate) <= new Date(toDate);

  const triggerBrowserDownload = (blob) => {
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = `clinical-report-${dateService.todayYyyyMmDd()}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
  };

  const handleDownload = async () => {
    if (!isWindowValid) {
      showToast({ tone: 'danger', message: '"From" date must be before "To" date.' });
      return;
    }
    setIsDownloading(true);
    try {
      const blob = await clinicalReportApi.downloadClinicalReport({
        from: dateService.toIsoStartOfDay(fromDate),
        to: dateService.toIsoEndOfDay(toDate),
      });
      triggerBrowserDownload(blob);
      showToast({ tone: 'success', message: 'Clinical PDF downloaded' });
    } catch (error) {
      showToast({ tone: 'danger', message: error?.message ?? 'Failed to download report' });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Container>
      <motion.div className="flex flex-col gap-6 md:gap-8" {...pageFadeRise}>
        <PageHeader
          description="Bundle your timeline, severity charts, triggers, and AI summaries into one A4 PDF."
          eyebrow="Exports"
          title="Clinical reports"
        />

        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <Card>
            <Card.Header>
              <div className="min-w-0">
                <Card.Title>Report window</Card.Title>
                <Card.Subtitle>
                  Defaults to the last 60 days. Only entries in this window are included.
                </Card.Subtitle>
              </div>
            </Card.Header>
            <Card.Body className="flex flex-col gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="From"
                  max={toDate || todayMax}
                  onChange={(event) => setFromDate(event.target.value)}
                  type="date"
                  value={fromDate}
                />
                <Input
                  label="To"
                  max={todayMax}
                  min={fromDate || undefined}
                  onChange={(event) => setToDate(event.target.value)}
                  type="date"
                  value={toDate}
                />
              </div>
              <div className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="m-0 text-xs text-muted">
                  PDF is generated on demand and never stored on our servers.
                </p>
                <Button
                  disabled={!isWindowValid}
                  icon={Download}
                  isLoading={isDownloading}
                  onClick={handleDownload}
                  variant="ai"
                >
                  Download PDF
                </Button>
              </div>
            </Card.Body>
          </Card>

          <Card className="relative overflow-hidden bg-ai-grad text-white">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl"
            />
            <Card.Pad padding="md" className="relative flex h-full flex-col justify-between gap-4">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15">
                <ShieldCheck aria-hidden="true" size={18} />
              </span>
              <div>
                <h2 className="m-0 text-lg font-semibold tracking-tight">Clinician-ready</h2>
                <p className="m-0 mt-1.5 text-sm leading-relaxed text-white/90">
                  A4 PDF with charts, triggers, AI summaries. Bring it to your next visit.
                </p>
              </div>
            </Card.Pad>
          </Card>
        </div>

        <section className="flex flex-col gap-3">
          <header className="flex items-center gap-2">
            <FileDown aria-hidden="true" className="text-primary" size={16} />
            <h2 className="m-0 text-sm font-semibold uppercase tracking-[0.12em] text-muted">
              Included sections
            </h2>
          </header>
          <motion.div
            animate="animate"
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            initial="initial"
            variants={staggerContainer}
          >
            {SECTIONS.map((section, index) => {
              const Icon = section.icon;
              return (
                <motion.div key={section.label} variants={staggerItem}>
                  <Card interactive className="h-full">
                    <Card.Pad padding="sm" className="flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                          <Icon aria-hidden="true" size={16} />
                        </span>
                        <Badge tone="neutral">{`0${index + 1}`.slice(-2)}</Badge>
                      </div>
                      <h3 className="m-0 text-sm font-semibold text-text">{section.label}</h3>
                      <p className="m-0 text-[13px] leading-relaxed text-muted">
                        {section.description}
                      </p>
                    </Card.Pad>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </section>
      </motion.div>
    </Container>
  );
};
