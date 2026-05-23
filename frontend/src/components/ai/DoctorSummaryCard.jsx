import { Activity, AlertTriangle, ClipboardList, Repeat } from 'lucide-react';

import { NarrativeProse } from './NarrativeProse.jsx';

const Section = ({ children, icon: Icon, title }) => (
  <section className="flex flex-col gap-3">
    <header className="flex items-center gap-2 text-primary-strong">
      <Icon aria-hidden="true" size={14} />
      <h4 className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em]">{title}</h4>
    </header>
    {children}
  </section>
);

const Empty = ({ children }) => (
  <p className="m-0 text-sm italic text-muted">{children}</p>
);

export const DoctorSummaryCard = ({ content }) => {
  if (!content || typeof content !== 'object') {
    return <NarrativeProse content={content} />;
  }
  const { keySymptoms = [], progression = '', importantConcerns = [], recurringPatterns = [] } =
    content;

  return (
    <div className="flex flex-col gap-7">
      <Section icon={ClipboardList} title="Key symptoms">
        {keySymptoms.length === 0 ? (
          <Empty>No dominant symptoms surfaced.</Empty>
        ) : (
          <ul className="grid gap-2.5">
            {keySymptoms.map((row, index) => (
              <li
                className="rounded-xl border border-border bg-surface-2 px-4 py-3"
                key={`${row.name ?? 'symptom'}-${index}`}
              >
                <p className="m-0 text-[15px] font-semibold tracking-tight text-text">{row.name}</p>
                <p className="m-0 mt-0.5 text-xs text-muted">
                  {row.frequency} · severity {row.severityRange}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section icon={Activity} title="Progression">
        <p className="m-0 max-w-[70ch] text-[15px] leading-[1.75] text-text">
          {progression || '—'}
        </p>
      </Section>

      <Section icon={AlertTriangle} title="Important concerns">
        {importantConcerns.length === 0 ? (
          <Empty>None flagged.</Empty>
        ) : (
          <ul className="m-0 grid max-w-[70ch] gap-2 pl-5 text-[15px] leading-[1.7]">
            {importantConcerns.map((concern, index) => (
              <li key={`concern-${index}`}>{concern}</li>
            ))}
          </ul>
        )}
      </Section>

      <Section icon={Repeat} title="Recurring patterns">
        {recurringPatterns.length === 0 ? (
          <Empty>None detected.</Empty>
        ) : (
          <ul className="m-0 grid max-w-[70ch] gap-2 pl-5 text-[15px] leading-[1.7]">
            {recurringPatterns.map((pattern, index) => (
              <li key={`pattern-${index}`}>{pattern}</li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
};
