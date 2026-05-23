import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useTheme } from '../../hooks/useTheme.js';

const formatDay = (value) =>
  new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

export const SeverityTrendChart = ({ entries = [], height = 220 }) => {
  const { isDark } = useTheme();

  const data = useMemo(() => {
    return [...entries]
      .sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime())
      .map((entry) => ({
        x: formatDay(entry.loggedAt),
        severity: entry.severity,
      }));
  }, [entries]);

  const axisColor = isDark ? '#94a3b8' : '#475569';
  const gridColor = isDark ? '#1e293b' : '#e2e8f0';
  const stroke = isDark ? '#38bdf8' : '#0ea5e9';
  const fill = isDark ? 'rgba(56,189,248,0.25)' : 'rgba(14,165,233,0.18)';
  const tooltipBg = isDark ? '#0f172a' : '#ffffff';
  const tooltipText = isDark ? '#e2e8f0' : '#0f172a';

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-dashed border-border bg-surface-2 text-sm text-muted"
        style={{ height }}
      >
        Log a few entries to see your severity trend.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="cnp-severity-grad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.5} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
          <XAxis
            axisLine={false}
            dataKey="x"
            stroke={axisColor}
            tick={{ fontSize: 11 }}
            tickLine={false}
          />
          <YAxis
            axisLine={false}
            domain={[0, 10]}
            stroke={axisColor}
            tick={{ fontSize: 11 }}
            tickLine={false}
            width={28}
          />
          <Tooltip
            contentStyle={{
              background: tooltipBg,
              border: `1px solid ${gridColor}`,
              borderRadius: 12,
              color: tooltipText,
              fontSize: 12,
              boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
            }}
            cursor={{ stroke: stroke, strokeOpacity: 0.2 }}
            formatter={(value) => [`${value}/10`, 'Severity']}
            labelStyle={{ color: axisColor }}
          />
          <Area
            dataKey="severity"
            fill="url(#cnp-severity-grad)"
            isAnimationActive
            stroke={stroke}
            strokeWidth={2}
            type="monotone"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
