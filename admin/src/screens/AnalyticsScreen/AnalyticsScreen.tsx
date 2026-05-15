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
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAnalytics } from '../../hooks/useAnalytics';
import './AnalyticsScreen.css';

export const AnalyticsScreen: React.FC = () => {
  const { dailyPoints, kpis, loading } = useAnalytics();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="analytics">
      <PageHeader title="Analytics" subtitle="User engagement — last 14 days" />

      <div className="analytics__kpis">
        <KpiBlock label="Total Users" value={kpis.totalUsers} />
        <KpiBlock label="Active Today" value={kpis.activeToday} />
        <KpiBlock label="Active (7 days)" value={kpis.activeLastWeek} />
        <KpiBlock label="Avg Day Streak" value={`${kpis.avgStreak}d`} />
        <KpiBlock label="Words Saved" value={kpis.wordsSaved} />
        <KpiBlock label="Achievements" value={kpis.achievementsUnlocked} />
        <KpiBlock label="Games Played" value={kpis.gamesPlayed} />
        <KpiBlock label="Flagged Events" value={kpis.flaggedEvents} />
      </div>

      <div className="analytics__chart-card">
        <p className="analytics__chart-title">
          Daily Active Users — last 14 days
        </p>
        <p className="analytics__chart-sub">
          Grouped by each user's last-active date
        </p>

        <div className="analytics__chart">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart
              data={dailyPoints}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7B3FC4" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#7B3FC4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                }}
              />
              <Area
                type="monotone"
                dataKey="activeUsers"
                name="Active Users"
                stroke="#7B3FC4"
                strokeWidth={2}
                fill="url(#analyticsGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <p className="analytics__note">
          For precise historical DAU, a pre-aggregation Cloud Function is
          needed. This chart approximates DAU using each user's{' '}
          <code>lastActive</code> timestamp.
        </p>
      </div>
    </div>
  );
};

const KpiBlock: React.FC<{ label: string; value: number | string }> = ({
  label,
  value,
}) => (
  <div className="analytics__kpi">
    <span className="analytics__kpi-value">{value}</span>
    <span className="analytics__kpi-label">{label}</span>
  </div>
);
