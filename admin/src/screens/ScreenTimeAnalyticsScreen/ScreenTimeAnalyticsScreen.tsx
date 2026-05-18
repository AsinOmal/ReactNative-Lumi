// 📖 What this does:
// Drill-down reached by clicking the "Screen Time Today" KPI on Analytics.
// Shows two views: a 14-day total-minutes trend (across all users) and a
// per-user leaderboard for the selected time window. Goal: surface "how much
// time is each kid actually spending in Lumi" — the headline KPI on the
// analytics screen only tells you today's number.

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
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
import { EmptyState } from '../../components/common/EmptyState';
import {
  useScreenTimeAnalytics,
  type ScreenTimeRange,
} from '../../hooks/useScreenTimeAnalytics';
import { ROUTES } from '../../constants/routes';
import './ScreenTimeAnalyticsScreen.css';

const RANGE_LABEL: Record<ScreenTimeRange, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  all: 'All time',
};

// Mobile writes minutes as a floating-point quotient of accumulated seconds,
// so values land as 40.02643… instead of 40. Round at display time — the
// underlying precision isn't useful here and the long decimals read as noise.
const fmtMinutes = (m: number): string => {
  const rounded = Math.round(m);
  if (rounded < 60) {
    return `${rounded}m`;
  }
  const h = Math.floor(rounded / 60);
  const rem = rounded % 60;
  return rem === 0 ? `${h}h` : `${h}h ${rem}m`;
};

export const ScreenTimeAnalyticsScreen: React.FC = () => {
  const navigate = useNavigate();
  const [range, setRange] = React.useState<ScreenTimeRange>('7d');
  const { perUser, trend, totalMinutes, loading, error } =
    useScreenTimeAnalytics(range);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="screen-time">
      <PageHeader
        title="Screen Time"
        subtitle={`${fmtMinutes(totalMinutes)} across all users — ${RANGE_LABEL[range].toLowerCase()}`}
        onBack={() => navigate(-1)}
      />

      {error && (
        <div className="screen-time__error">
          Could not load screen-time analytics: {error}
        </div>
      )}

      <div className="screen-time__chart-card">
        <p className="screen-time__chart-title">
          Total minutes / day — last 14 days
        </p>
        <p className="screen-time__chart-sub">
          Sum of all users&apos; daily totals.
        </p>
        <div className="screen-time__chart">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={trend}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="stGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7B3FC4" stopOpacity={0.18} />
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
                formatter={(v: number) => [`${v}m`, 'Total Minutes']}
              />
              <Area
                type="monotone"
                dataKey="totalMinutes"
                name="Total Minutes"
                stroke="#7B3FC4"
                strokeWidth={2}
                fill="url(#stGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="screen-time__filters">
        {(['7d', '30d', 'all'] as ScreenTimeRange[]).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            className={
              r === range
                ? 'screen-time__filter screen-time__filter--active'
                : 'screen-time__filter'
            }
          >
            {RANGE_LABEL[r]}
          </button>
        ))}
      </div>

      {perUser.length === 0 ? (
        <EmptyState
          icon={<Clock size={40} />}
          title="No screen-time data yet"
          description="Users haven't accumulated any tracked time in this window. Numbers appear once the mobile app records a session."
        />
      ) : (
        <div className="screen-time__card">
          <table className="screen-time__table">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Total Time</th>
                <th>Days Active</th>
                <th>Avg / Day</th>
                <th>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {perUser.map((u, i) => {
                const avg =
                  u.daysActive > 0 ? Math.round(u.totalMinutes / u.daysActive) : 0;
                return (
                  <tr key={u.uid} className="screen-time__row">
                    <td className="screen-time__rank">{i + 1}</td>
                    <td className="screen-time__uid">
                      <Link
                        to={ROUTES.USER_DETAIL.replace(':uid', u.uid)}
                        className="screen-time__uid-link"
                      >
                        {u.uid.slice(0, 8)}…
                      </Link>
                    </td>
                    <td>
                      <span className="screen-time__count">
                        {fmtMinutes(u.totalMinutes)}
                      </span>
                    </td>
                    <td className="screen-time__sub">{u.daysActive}</td>
                    <td className="screen-time__sub">{fmtMinutes(avg)}</td>
                    <td className="screen-time__date">{u.lastActiveDate}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
