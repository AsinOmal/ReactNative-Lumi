import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useDarkMode } from '../../../hooks/useDarkMode';
import './TopWordsCard.css';

interface WordStat {
  word: string;
  count: number;
}

interface TopWordsCardProps {
  data: WordStat[];
}

const BAR_COLORS = [
  '#6366F1',
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#14B8A6',
  '#8B5CF6',
  '#F97316',
];

export const TopWordsCard: React.FC<TopWordsCardProps> = ({ data }) => {
  const { isDark } = useDarkMode();
  const grid = isDark ? '#252F45' : '#E2E8F0';
  const tick = isDark ? '#64748B' : '#94A3B8';
  const wordTick = isDark ? '#94A3B8' : '#64748B';
  const tipBg = isDark ? '#161C27' : '#FFFFFF';
  const tipBdr = isDark ? '#252F45' : '#E2E8F0';
  const tipClr = isDark ? '#F1F5F9' : '#0F172A';

  return (
    <div className="tw-card">
      <div className="tw-card__header">
        <div>
          <p className="tw-card__title">Top Scanned Words</p>
          <p className="tw-card__subtitle">
            Most frequently scanned by all users
          </p>
        </div>
      </div>

      <div className="tw-card__chart">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={grid}
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: tick }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="word"
              tick={{ fontSize: 12, fill: wordTick }}
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: `1px solid ${tipBdr}`,
                backgroundColor: tipBg,
                color: tipClr,
              }}
              formatter={(v: number) => [`${v} scans`, 'Count']}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
