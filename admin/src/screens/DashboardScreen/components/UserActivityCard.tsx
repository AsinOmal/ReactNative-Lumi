import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useDarkMode } from '../../../hooks/useDarkMode';
import './UserActivityCard.css';

interface DailyPoint {
  date: string;
  activeUsers: number;
  newUsers: number;
}

interface UserActivityCardProps {
  data: DailyPoint[];
}

export const UserActivityCard: React.FC<UserActivityCardProps> = ({ data }) => {
  const { isDark } = useDarkMode();
  const grid = isDark ? '#252F45' : '#E2E8F0';
  const tick = isDark ? '#64748B' : '#94A3B8';
  const tipBg = isDark ? '#161C27' : '#FFFFFF';
  const tipBdr = isDark ? '#252F45' : '#E2E8F0';
  const tipClr = isDark ? '#F1F5F9' : '#0F172A';

  return (
    <div className="ua-card">
      <div className="ua-card__header">
        <div>
          <p className="ua-card__title">User Activity</p>
          <p className="ua-card__subtitle">
            Daily active and new users — last 14 days
          </p>
        </div>
      </div>

      <div className="ua-card__chart">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart
            data={data}
            margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="gradActive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradNew" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: tick }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: tick }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: `1px solid ${tipBdr}`,
                backgroundColor: tipBg,
                color: tipClr,
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              }}
            />
            <Area
              type="monotone"
              dataKey="activeUsers"
              name="Active"
              stroke="#6366F1"
              strokeWidth={2}
              fill="url(#gradActive)"
            />
            <Area
              type="monotone"
              dataKey="newUsers"
              name="New"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#gradNew)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="ua-card__legend">
        <div className="ua-card__legend-item">
          <span
            className="ua-card__legend-dot"
            style={{ background: '#6366F1' }}
          />
          <span>Active Users</span>
        </div>
        <div className="ua-card__legend-item">
          <span
            className="ua-card__legend-dot"
            style={{ background: '#10B981' }}
          />
          <span>New Signups</span>
        </div>
      </div>
    </div>
  );
};
