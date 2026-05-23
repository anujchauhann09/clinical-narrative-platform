import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useTheme } from '../../hooks/useTheme.js';

export const TriggerBarChart = ({ data = [], height = 240 }) => {
  const { isDark } = useTheme();
  const axisColor = isDark ? '#94a3b8' : '#475569';
  const gridColor = isDark ? '#1e293b' : '#e2e8f0';
  const bar = isDark ? '#38bdf8' : '#0ea5e9';

  if (!data.length) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-dashed border-border bg-surface-2 text-sm text-muted"
        style={{ height }}
      >
        Not enough triggers logged yet.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, bottom: 0, left: 12 }}>
          <CartesianGrid horizontal={false} stroke={gridColor} strokeDasharray="3 3" />
          <XAxis
            allowDecimals={false}
            axisLine={false}
            stroke={axisColor}
            tick={{ fontSize: 11 }}
            tickLine={false}
            type="number"
          />
          <YAxis
            axisLine={false}
            dataKey="name"
            stroke={axisColor}
            tick={{ fontSize: 11 }}
            tickLine={false}
            type="category"
            width={120}
          />
          <Tooltip
            contentStyle={{
              background: isDark ? '#0f172a' : '#ffffff',
              border: `1px solid ${gridColor}`,
              borderRadius: 12,
              color: isDark ? '#e2e8f0' : '#0f172a',
              fontSize: 12,
            }}
            cursor={{ fill: isDark ? 'rgba(56,189,248,0.08)' : 'rgba(14,165,233,0.06)' }}
            formatter={(value) => [`${value} entries`, 'Co-occurrences']}
          />
          <Bar dataKey="count" fill={bar} radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
