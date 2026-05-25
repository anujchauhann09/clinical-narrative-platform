import { APP_NAME, APP_TAGLINE } from '../../constants/branding.js';
import { renderSeverityChartSvg, renderTriggerBarChartSvg } from '../charts/severityChart.js';

const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      default:
        return char;
    }
  });


const formatDateTime = (value, timeZone) => {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short', timeZone });
};

const formatDate = (value, timeZone) => {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { dateStyle: 'long', timeZone });
};

const renderChipList = (items, emptyLabel) => {
  if (!items?.length) return `<span class="empty">${escapeHtml(emptyLabel)}</span>`;
  return items.map((item) => `<span class="chip">${escapeHtml(item)}</span>`).join('');
};

const renderTimelineRow = (entry, timeZone) => {
  const symptoms = (entry.symptoms ?? []).map((symptom) => symptom.name);
  const triggers = (entry.triggers ?? []).map((trigger) => trigger.name);
  return `
    <tr>
      <td class="col-date">${escapeHtml(formatDateTime(entry.loggedAt, timeZone))}</td>
      <td class="col-severity"><span class="severity-pill severity-pill--${entry.severity >= 7 ? 'high' : entry.severity >= 4 ? 'mid' : 'low'}">${escapeHtml(entry.severity ?? '—')}</span></td>
      <td class="col-mood">${escapeHtml(entry.mood ?? '—')}</td>
      <td class="col-symptoms">${renderChipList(symptoms, 'none')}</td>
      <td class="col-triggers">${renderChipList(triggers, 'none')}</td>
      <td class="col-notes">${escapeHtml(entry.notes ?? '')}</td>
    </tr>
  `;
};

const renderNarrativeBlock = (label, summary, timeZone) => {
  if (!summary) {
    return `
      <div class="narrative-block narrative-block--empty">
        <h4>${escapeHtml(label)}</h4>
        <p class="empty">Not generated yet. Open Narratives to create one.</p>
      </div>
    `;
  }
  const content = typeof summary.content === 'string' ? summary.content : '';
  const paragraphs = content
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  return `
    <div class="narrative-block">
      <h4>${escapeHtml(label)}</h4>
      <p class="narrative-block__meta">Generated ${escapeHtml(formatDateTime(summary.generatedAt, timeZone))}</p>
      ${paragraphs.map((paragraph) => `<p class="narrative-block__paragraph">${escapeHtml(paragraph)}</p>`).join('') || '<p class="empty">Empty narrative.</p>'}
    </div>
  `;
};

const renderDoctorSummary = (summary, timeZone) => {
  if (!summary || !summary.content || typeof summary.content !== 'object') {
    return `
      <div class="narrative-block narrative-block--empty">
        <h4>Doctor visit summary</h4>
        <p class="empty">Not generated yet. Open Narratives to create one.</p>
      </div>
    `;
  }
  const { keySymptoms = [], progression = '', importantConcerns = [], recurringPatterns = [] } =
    summary.content;

  return `
    <div class="doctor-summary">
      <h4>Doctor visit summary</h4>
      <p class="narrative-block__meta">Generated ${escapeHtml(formatDateTime(summary.generatedAt, timeZone))}</p>

      <h5>Key symptoms</h5>
      ${
        keySymptoms.length === 0
          ? '<p class="empty">None.</p>'
          : `<ul class="doctor-summary__list">${keySymptoms
              .map(
                (row) =>
                  `<li><strong>${escapeHtml(row.name)}</strong><span>${escapeHtml(row.frequency)} · severity ${escapeHtml(row.severityRange)}</span></li>`,
              )
              .join('')}</ul>`
      }

      <h5>Progression</h5>
      <p class="doctor-summary__paragraph">${escapeHtml(progression || '—')}</p>

      <h5>Important concerns</h5>
      ${
        importantConcerns.length === 0
          ? '<p class="empty">None flagged.</p>'
          : `<ul class="doctor-summary__bullets">${importantConcerns
              .map((concern) => `<li>${escapeHtml(concern)}</li>`)
              .join('')}</ul>`
      }

      <h5>Recurring patterns</h5>
      ${
        recurringPatterns.length === 0
          ? '<p class="empty">None detected.</p>'
          : `<ul class="doctor-summary__bullets">${recurringPatterns
              .map((pattern) => `<li>${escapeHtml(pattern)}</li>`)
              .join('')}</ul>`
      }
    </div>
  `;
};

const CSS = `
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; color: #13201f; font-family: 'Helvetica', 'Inter', 'Segoe UI', sans-serif; font-size: 11px; line-height: 1.45; }
  body { padding: 0; }

  .report { padding: 0; }
  .section { page-break-inside: avoid; margin-bottom: 22px; }
  .section--break { page-break-before: always; }

  .cover { text-align: left; padding: 8px 0 18px; border-bottom: 2px solid #116a63; margin-bottom: 24px; }
  .cover__eyebrow { text-transform: uppercase; font-size: 9px; letter-spacing: 0.12em; color: #60706d; margin: 0 0 6px; font-weight: 600; }
  .cover__title { margin: 0 0 4px; font-size: 22px; color: #0a4f4b; }
  .cover__subtitle { margin: 0; color: #60706d; font-size: 12px; }

  h2.section__title { font-size: 14px; color: #0a4f4b; margin: 0 0 10px; padding-bottom: 4px; border-bottom: 1px solid #d8e3e1; }
  h3.section__subtitle { font-size: 12px; color: #0a4f4b; margin: 14px 0 6px; }
  h4 { margin: 0 0 6px; font-size: 12px; color: #0a4f4b; }
  h5 { margin: 10px 0 4px; font-size: 11px; color: #0a4f4b; text-transform: uppercase; letter-spacing: 0.04em; }
  p { margin: 0 0 6px; }

  .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px 24px; }
  .meta-row { display: flex; gap: 6px; }
  .meta-row__label { color: #60706d; font-weight: 600; min-width: 110px; }
  .meta-row__value { color: #13201f; }

  .metrics-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 12px; }
  .metric { border: 1px solid #d8e3e1; border-radius: 6px; padding: 8px 10px; }
  .metric__label { color: #60706d; font-size: 9px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
  .metric__value { display: block; font-size: 16px; font-weight: 700; color: #0a4f4b; margin-top: 2px; }

  table { width: 100%; border-collapse: collapse; font-size: 10px; }
  th, td { border: 1px solid #d8e3e1; padding: 5px 6px; text-align: left; vertical-align: top; }
  th { background: #eef5f4; color: #0a4f4b; font-size: 9px; text-transform: uppercase; letter-spacing: 0.04em; }
  tr { page-break-inside: avoid; }

  .col-date { width: 18%; white-space: nowrap; }
  .col-severity { width: 8%; text-align: center; }
  .col-mood { width: 10%; }
  .col-symptoms { width: 20%; }
  .col-triggers { width: 18%; }
  .col-notes { width: 26%; }

  .severity-pill { display: inline-block; padding: 1px 6px; border-radius: 999px; font-weight: 700; color: #ffffff; font-size: 10px; }
  .severity-pill--high { background: #b42318; }
  .severity-pill--mid { background: #8a5a16; }
  .severity-pill--low { background: #16703c; }

  .chip { display: inline-block; padding: 1px 6px; margin: 1px 3px 1px 0; border-radius: 999px; background: #eef5f4; color: #0a4f4b; font-size: 9px; }
  .empty { color: #60706d; font-style: italic; }

  .chart-wrap { border: 1px solid #d8e3e1; border-radius: 6px; padding: 6px; background: #ffffff; }
  .chart-wrap svg { width: 100%; height: auto; }

  .narrative-block { border-left: 3px solid #116a63; padding: 6px 10px; margin-bottom: 10px; background: #f6f8f8; }
  .narrative-block--empty { border-left-color: #d8e3e1; }
  .narrative-block__meta { color: #60706d; font-size: 9px; margin-bottom: 6px; }
  .narrative-block__paragraph { margin: 0 0 4px; }

  .doctor-summary { border-left: 3px solid #8a5a16; padding: 6px 10px; margin-bottom: 10px; background: #faf6ee; }
  .doctor-summary__list { margin: 4px 0 8px; padding-left: 16px; }
  .doctor-summary__list li { margin-bottom: 2px; }
  .doctor-summary__list span { display: block; color: #60706d; font-size: 9px; }
  .doctor-summary__bullets { margin: 4px 0 8px; padding-left: 16px; }
  .doctor-summary__paragraph { margin: 0 0 6px; }

  .disclaimer { margin-top: 18px; padding: 8px 10px; border: 1px solid #d8e3e1; border-radius: 6px; background: #f6f8f8; color: #60706d; font-size: 9px; }
`;

export const renderClinicalReportHtml = ({
  patient,
  window,
  summary,
  entries,
  topSymptoms,
  topTriggers,
  severityTrend,
  narratives,
  generatedAt,
  timeZone,
}) => {
  const profile = patient.profile ?? {};
  const fullName = profile.name ?? '—';

  const severityChart = renderSeverityChartSvg(entries);
  const triggerChart = renderTriggerBarChartSvg(topTriggers);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Clinical Report — ${escapeHtml(fullName)}</title>
  <style>${CSS}</style>
</head>
<body>
  <div class="report">
    <header class="cover">
      <p class="cover__eyebrow">${escapeHtml(APP_NAME)} · ${escapeHtml(APP_TAGLINE)}</p>
      <h1 class="cover__title">Clinical Report</h1>
      <p class="cover__subtitle">
        ${escapeHtml(fullName)} · Generated ${escapeHtml(formatDateTime(generatedAt, timeZone))}<br/>
        Window: ${escapeHtml(formatDate(window.from, timeZone))} → ${escapeHtml(formatDate(window.to, timeZone))}
      </p>
    </header>

    <section class="section">
      <h2 class="section__title">1. Patient summary</h2>
      <div class="meta-grid">
        <div class="meta-row"><span class="meta-row__label">Name</span><span class="meta-row__value">${escapeHtml(fullName)}</span></div>
        <div class="meta-row"><span class="meta-row__label">Email</span><span class="meta-row__value">${escapeHtml(patient.email)}</span></div>
        <div class="meta-row"><span class="meta-row__label">Sex</span><span class="meta-row__value">${escapeHtml(profile.sex ?? '—')}</span></div>
        <div class="meta-row"><span class="meta-row__label">Date of birth</span><span class="meta-row__value">${escapeHtml(profile.dateOfBirth ? formatDate(profile.dateOfBirth) : '—')}</span></div>
        <div class="meta-row"><span class="meta-row__label">Phone</span><span class="meta-row__value">${escapeHtml(profile.phone ?? '—')}</span></div>
      </div>
      ${
        profile.bio
          ? `<h3 class="section__subtitle">About</h3><p>${escapeHtml(profile.bio)}</p>`
          : ''
      }

      <div class="metrics-row">
        <div class="metric"><span class="metric__label">Entries in window</span><span class="metric__value">${summary.entriesInWindow}</span></div>
        <div class="metric"><span class="metric__label">Avg severity</span><span class="metric__value">${summary.averageSeverity ?? '—'}</span></div>
        <div class="metric"><span class="metric__label">Peak severity</span><span class="metric__value">${summary.peakSeverity ?? '—'}</span></div>
        <div class="metric"><span class="metric__label">Distinct symptoms</span><span class="metric__value">${summary.distinctSymptoms}</span></div>
      </div>
    </section>

    <section class="section">
      <h2 class="section__title">2. Symptom timeline</h2>
      ${
        entries.length === 0
          ? '<p class="empty">No entries logged in this window.</p>'
          : `<table>
              <thead>
                <tr>
                  <th class="col-date">Logged at</th>
                  <th class="col-severity">Severity</th>
                  <th class="col-mood">Mood</th>
                  <th class="col-symptoms">Symptoms</th>
                  <th class="col-triggers">Triggers</th>
                  <th class="col-notes">Notes</th>
                </tr>
              </thead>
              <tbody>${entries.map((entry) => renderTimelineRow(entry, timeZone)).join('')}</tbody>
            </table>`
      }
    </section>

    <section class="section">
      <h2 class="section__title">3. Severity over time</h2>
      <div class="chart-wrap">${severityChart}</div>
      ${
        severityTrend && severityTrend.direction !== 'insufficient_data'
          ? `<p style="margin-top:6px">${escapeHtml(severityTrend.headline ?? '')}</p>`
          : ''
      }
    </section>

    <section class="section">
      <h2 class="section__title">4. Triggers</h2>
      <h3 class="section__subtitle">Top triggers</h3>
      <div class="chart-wrap">${triggerChart}</div>
      ${
        topSymptoms.length
          ? `<h3 class="section__subtitle">Top symptoms (frequency · avg severity)</h3>
             <ul>${topSymptoms
               .map(
                 (item) =>
                   `<li>${escapeHtml(item.name)} — ${item.count} entries · avg ${item.averageSeverity ?? '—'}</li>`,
               )
               .join('')}</ul>`
          : ''
      }
    </section>

    <section class="section">
      <h2 class="section__title">5. AI summary</h2>
      ${renderNarrativeBlock('Symptom narrative', narratives.symptom, timeZone)}
      ${renderNarrativeBlock('Pattern explanation', narratives.pattern, timeZone)}
      ${renderNarrativeBlock('Timeline narrative', narratives.timeline, timeZone)}
      ${renderDoctorSummary(narratives.doctor, timeZone)}
    </section>

    <p class="disclaimer">
      This report is generated from patient-reported data and AI-assisted summaries on ${escapeHtml(APP_NAME)}.
      It is not a medical diagnosis and does not replace evaluation by a licensed clinician. Always discuss findings
      with your healthcare provider before making clinical decisions.
    </p>
  </div>
</body>
</html>`;
};
