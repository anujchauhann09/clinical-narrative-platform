import {
  Activity,
  CalendarRange,
  ClipboardList,
  Download,
  FileDown,
  Pill,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { clinicalReportApi } from '../api/clinicalReportApi.js';
import { Badge, Button, Card } from '../components/index.js';
import { useToast } from '../context/ToastContext.jsx';

const SECTIONS = [
  { label: 'Patient summary', description: 'Name, contact, demographics, window-level metrics.', icon: ClipboardList },
  { label: 'Symptom timeline', description: 'Tabular log of entries with severity, mood, symptoms, triggers, notes.', icon: CalendarRange },
  { label: 'Severity charts', description: 'Line chart of severity across the window, plus top-trigger bar chart.', icon: Activity },
  { label: 'Triggers', description: 'Top triggers and top symptoms ranked by frequency.', icon: Stethoscope },
  { label: 'AI summary', description: 'Latest symptom narrative, pattern explanation, timeline, and doctor visit summary.', icon: Sparkles },
  { label: 'Medication notes', description: 'Placeholder — medication tracking is a future enhancement.', icon: Pill },
];

const toIsoStartOfDay = (yyyyMmDd) => {
  if (!yyyyMmDd) return undefined;
  const date = new Date(`${yyyyMmDd}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const toIsoEndOfDay = (yyyyMmDd) => {
  if (!yyyyMmDd) return undefined;
  const date = new Date(`${yyyyMmDd}T23:59:59.999`);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const todayYyyyMmDd = () => {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

const sixtyDaysAgoYyyyMmDd = () => {
  const date = new Date();
  date.setDate(date.getDate() - 60);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

export const ReportsPage = () => {
  const { showToast } = useToast();
  const todayMax = useMemo(todayYyyyMmDd, []);
  const defaultFrom = useMemo(sixtyDaysAgoYyyyMmDd, []);
  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(todayMax);
  const [isDownloading, setIsDownloading] = useState(false);

  const isWindowValid = !fromDate || !toDate || new Date(fromDate) <= new Date(toDate);

  const triggerBrowserDownload = (blob) => {
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = `clinical-report-${todayYyyyMmDd()}.pdf`;
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
        from: toIsoStartOfDay(fromDate),
        to: toIsoEndOfDay(toDate),
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
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Exports</p>
          <h1>Clinical reports</h1>
        </div>
      </header>

      <Card className="narrative-banner">
        <span className="narrative-banner__icon">
          <ShieldCheck aria-hidden="true" size={20} />
        </span>
        <div>
          <h2>Generate a clinician-ready PDF</h2>
          <p>
            Bundles your symptom timeline, severity charts, triggers, and latest AI summaries into a
            single A4 PDF. The export is generated on demand and is not stored on our servers.
          </p>
        </div>
      </Card>

      <section className="insight-section">
        <header className="insight-section__header">
          <CalendarRange aria-hidden="true" size={18} />
          <h2>Report window</h2>
        </header>
        <Card className="report-window">
          <div className="report-window__fields">
            <label className="field" htmlFor="report-from">
              <span className="field__label">From</span>
              <input
                className="field__input"
                id="report-from"
                max={toDate || todayMax}
                onChange={(event) => setFromDate(event.target.value)}
                type="date"
                value={fromDate}
              />
            </label>
            <label className="field" htmlFor="report-to">
              <span className="field__label">To</span>
              <input
                className="field__input"
                id="report-to"
                max={todayMax}
                min={fromDate || undefined}
                onChange={(event) => setToDate(event.target.value)}
                type="date"
                value={toDate}
              />
            </label>
          </div>
          <p className="report-window__hint">
            Defaults to the last 60 days. The PDF will only include entries logged within this
            window.
          </p>
          <div className="report-window__actions">
            <Button
              disabled={!isWindowValid}
              icon={Download}
              isLoading={isDownloading}
              onClick={handleDownload}
            >
              Download PDF
            </Button>
          </div>
        </Card>
      </section>

      <section className="insight-section">
        <header className="insight-section__header">
          <FileDown aria-hidden="true" size={18} />
          <h2>Included sections</h2>
        </header>
        <div className="report-sections">
          {SECTIONS.map((section, index) => {
            const Icon = section.icon;
            return (
              <Card className="report-section-card" key={section.label}>
                <div className="report-section-card__head">
                  <Badge tone="neutral">{`0${index + 1}`.slice(-2)}</Badge>
                  <span className="report-section-card__icon">
                    <Icon aria-hidden="true" size={18} />
                  </span>
                  <h3>{section.label}</h3>
                </div>
                <p>{section.description}</p>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
};
