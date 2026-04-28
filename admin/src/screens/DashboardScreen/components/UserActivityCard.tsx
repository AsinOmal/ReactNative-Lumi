import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import './UserActivityCard.css';

interface DailyPoint {
  date: string;
  activeUsers: number;
  newUsers: number;
}

interface UserActivityCardProps {
  data: DailyPoint[];
}

export const UserActivityCard: React.FC<UserActivityCardProps> = ({ data }) => (
  <div className="ua-card">
    <div className="ua-card__header">
      <div>
        <p className="ua-card__title">User Activity</p>
        <p className="ua-card__subtitle">Daily active and new users — last 14 days</p>
      </div>
    </div>

    <div className="ua-card__chart">
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradActive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7B3FC4" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#7B3FC4" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradNew" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
          />
          <Area type="monotone" dataKey="activeUsers" name="Active" stroke="#7B3FC4" strokeWidth={2} fill="url(#gradActive)" />
          <Area type="monotone" dataKey="newUsers" name="New" stroke="#10B981" strokeWidth={2} fill="url(#gradNew)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>

    <div className="ua-card__legend">
      <div className="ua-card__legend-item">
        <span className="ua-card__legend-dot" style={{ background: '#7B3FC4' }} />
        <span>Active Users</span>
      </div>
      <div className="ua-card__legend-item">
        <span className="ua-card__legend-dot" style={{ background: '#10B981' }} />
        <span>New Signups</span>
      </div>
    </div>
  </div>
);
