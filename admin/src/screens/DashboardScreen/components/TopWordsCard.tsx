import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import './TopWordsCard.css';

interface WordStat {
  word: string;
  count: number;
}

interface TopWordsCardProps {
  data: WordStat[];
}

const BAR_COLORS = ['#7B3FC4', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#14B8A6', '#8B5CF6', '#F97316'];

export const TopWordsCard: React.FC<TopWordsCardProps> = ({ data }) => (
  <div className="tw-card">
    <div className="tw-card__header">
      <div>
        <p className="tw-card__title">Top Scanned Words</p>
        <p className="tw-card__subtitle">Most frequently scanned by all users</p>
      </div>
    </div>

    <div className="tw-card__chart">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="word" tick={{ fontSize: 12, fill: '#374151' }} tickLine={false} axisLine={false} width={80} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }}
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
