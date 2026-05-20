const WIDTH = 720;
const HEIGHT = 220;
const PADDING = { top: 16, right: 16, bottom: 32, left: 32 };
const MIN_SEVERITY = 0;
const MAX_SEVERITY = 10;

const buildScale = (count, plotWidth) => {
  if (count <= 1) return () => PADDING.left + plotWidth / 2;
  const step = plotWidth / (count - 1);
  return (index) => PADDING.left + step * index;
};

const buildYScale = (plotHeight) => (value) => {
  const clamped = Math.min(MAX_SEVERITY, Math.max(MIN_SEVERITY, value));
  const ratio = (clamped - MIN_SEVERITY) / (MAX_SEVERITY - MIN_SEVERITY);
  return PADDING.top + plotHeight - ratio * plotHeight;
};

const escapeXml = (value) =>
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
        return '&apos;';
      default:
        return char;
    }
  });

const formatDayLabel = (date) =>
  date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

export const renderSeverityChartSvg = (entries) => {
  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;

  if (!entries?.length) {
    return `
      <svg viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Severity chart placeholder">
        <rect width="${WIDTH}" height="${HEIGHT}" fill="#f6f8f8" />
        <text x="${WIDTH / 2}" y="${HEIGHT / 2}" text-anchor="middle" font-size="12" fill="#60706d" font-family="Inter, sans-serif">
          No severity data in this window.
        </text>
      </svg>
    `.trim();
  }

  const sorted = [...entries].sort(
    (a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime(),
  );

  const xAt = buildScale(sorted.length, plotWidth);
  const yAt = buildYScale(plotHeight);

  const points = sorted.map((entry, index) => ({
    x: xAt(index),
    y: yAt(entry.severity ?? 0),
    severity: entry.severity ?? 0,
    label: formatDayLabel(new Date(entry.loggedAt)),
  }));

  const pathData = points.map((p, index) => `${index === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');

  const yTicks = [0, 2, 4, 6, 8, 10];
  const xTickIndices =
    sorted.length <= 6
      ? sorted.map((_, idx) => idx)
      : [0, Math.floor((sorted.length - 1) * 0.25), Math.floor((sorted.length - 1) * 0.5), Math.floor((sorted.length - 1) * 0.75), sorted.length - 1];

  const yAxisMarkup = yTicks
    .map((tick) => {
      const y = yAt(tick);
      return `
        <line x1="${PADDING.left}" y1="${y}" x2="${WIDTH - PADDING.right}" y2="${y}" stroke="#eef5f4" stroke-width="1" />
        <text x="${PADDING.left - 6}" y="${y + 3}" text-anchor="end" font-size="10" fill="#60706d" font-family="Inter, sans-serif">${tick}</text>
      `;
    })
    .join('');

  const xAxisMarkup = xTickIndices
    .map((idx) => {
      const point = points[idx];
      return `
        <line x1="${point.x}" y1="${HEIGHT - PADDING.bottom}" x2="${point.x}" y2="${HEIGHT - PADDING.bottom + 4}" stroke="#60706d" stroke-width="1" />
        <text x="${point.x}" y="${HEIGHT - PADDING.bottom + 16}" text-anchor="middle" font-size="10" fill="#60706d" font-family="Inter, sans-serif">${escapeXml(point.label)}</text>
      `;
    })
    .join('');

  const pointMarkup = points
    .map(
      (point) =>
        `<circle cx="${point.x.toFixed(2)}" cy="${point.y.toFixed(2)}" r="3" fill="#116a63" stroke="#ffffff" stroke-width="1" />`,
    )
    .join('');

  return `
    <svg viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Severity over time chart">
      <rect width="${WIDTH}" height="${HEIGHT}" fill="#ffffff" />
      ${yAxisMarkup}
      <line x1="${PADDING.left}" y1="${HEIGHT - PADDING.bottom}" x2="${WIDTH - PADDING.right}" y2="${HEIGHT - PADDING.bottom}" stroke="#60706d" stroke-width="1" />
      <line x1="${PADDING.left}" y1="${PADDING.top}" x2="${PADDING.left}" y2="${HEIGHT - PADDING.bottom}" stroke="#60706d" stroke-width="1" />
      <path d="${pathData}" fill="none" stroke="#116a63" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
      ${pointMarkup}
      ${xAxisMarkup}
      <text x="${PADDING.left}" y="${PADDING.top - 4}" font-size="10" fill="#60706d" font-family="Inter, sans-serif">Severity (1-10)</text>
    </svg>
  `.trim();
};

export const renderTriggerBarChartSvg = (triggers) => {
  const items = (triggers ?? []).slice(0, 6);
  if (!items.length) {
    return `
      <svg viewBox="0 0 ${WIDTH} 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Top triggers placeholder">
        <rect width="${WIDTH}" height="120" fill="#f6f8f8" />
        <text x="${WIDTH / 2}" y="60" text-anchor="middle" font-size="12" fill="#60706d" font-family="Inter, sans-serif">
          No triggers logged in this window.
        </text>
      </svg>
    `.trim();
  }

  const rowHeight = 24;
  const labelWidth = 140;
  const barOriginX = labelWidth + 16;
  const maxBarWidth = WIDTH - barOriginX - PADDING.right;
  const maxCount = Math.max(...items.map((item) => item.count ?? 0), 1);
  const totalHeight = items.length * rowHeight + 16;

  const rows = items
    .map((item, index) => {
      const y = 8 + index * rowHeight;
      const barWidth = Math.max(2, (Number(item.count ?? 0) / maxCount) * maxBarWidth);
      return `
        <text x="${labelWidth}" y="${y + 14}" text-anchor="end" font-size="11" fill="#13201f" font-family="Inter, sans-serif">${escapeXml(item.name)}</text>
        <rect x="${barOriginX}" y="${y + 4}" width="${barWidth.toFixed(2)}" height="14" rx="3" fill="#116a63" />
        <text x="${barOriginX + barWidth + 6}" y="${y + 14}" font-size="10" fill="#60706d" font-family="Inter, sans-serif">${item.count ?? 0}</text>
      `;
    })
    .join('');

  return `
    <svg viewBox="0 0 ${WIDTH} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Top triggers bar chart">
      <rect width="${WIDTH}" height="${totalHeight}" fill="#ffffff" />
      ${rows}
    </svg>
  `.trim();
};
