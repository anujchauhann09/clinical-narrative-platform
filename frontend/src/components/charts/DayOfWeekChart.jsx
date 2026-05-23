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

export const DayOfWeekChart = ({ days = [], height = 220 }) => {
  const { isDark } = useTheme();
  const axisColor = isDark ? '#94a3b8' : '#475569';
  const gridColor = isDark ? '#1e293b' : '#e2e8f0';
  const bar = isDark ? '#22d3ee' : '#0ea5e9';

  const data = days.map((day) => ({
    name: day.label?.slice(0, 3) ?? '',
    count: day.count ?? 0,
  }));

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
          <XAxis
            axisLine={false}
            dataKey="name"
            stroke={axisColor}
            tick={{ fontSize: 11 }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            stroke={axisColor}
            tick={{ fontSize: 11 }}
            tickLine={false}
            width={28}
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
            formatter={(value) => [`${value} entries`, 'Logged']}
          />
          <Bar dataKey="count" fill={bar} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
