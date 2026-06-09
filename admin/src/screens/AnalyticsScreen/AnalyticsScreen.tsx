import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
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
import { useContentInsights } from '../../hooks/useContentInsights';
import { ROUTES } from '../../constants/routes';
import './AnalyticsScreen.css';

export const AnalyticsScreen: React.FC = () => {
  const {
    dailyPoints,
    kpis,
    topPreviewPacks,
    topPreviewWords,
    slowPreviewRows,
    loading,
  } = useAnalytics();
  const {
    summary,
    alerts,
    topScannedWords,
    topUnknownWords,
    topWishlistedWords,
    loading: insightsLoading,
  } = useContentInsights();
  const navigate = useNavigate();

  if (loading) {
    return <LoadingSpinner />;
  }

  // KPI tiles that have drill-down screens use `to`. The rest stay static
  // (passing `to` makes the tile clickable + adds a subtle hover affordance).
  return (
    <div className="analytics">
      <PageHeader title="Analytics" subtitle="User engagement — last 14 days" />

      <div className="analytics__kpis">
        <KpiBlock label="Total Users" value={kpis.totalUsers} />
        <KpiBlock label="Active Today" value={kpis.activeToday} />
        <KpiBlock label="Active (7 days)" value={kpis.activeLastWeek} />
        <KpiBlock label="Avg Day Streak" value={`${kpis.avgStreak}d`} />
        <KpiBlock
          label="Words Saved"
          value={kpis.wordsSaved}
          onClick={() => navigate(ROUTES.ANALYTICS_SAVED_WORDS)}
        />
        <KpiBlock
          label="Achievements"
          value={kpis.achievementsUnlocked}
          onClick={() => navigate(ROUTES.ANALYTICS_ACHIEVEMENTS)}
        />
        <KpiBlock
          label="Games Played"
          value={kpis.gamesPlayed}
          onClick={() => navigate(ROUTES.ANALYTICS_GAMES)}
        />
        <KpiBlock
          label="Flagged Events"
          value={kpis.flaggedEvents}
          onClick={() => navigate(ROUTES.ANALYTICS_FLAGGED_EVENTS)}
        />
        <KpiBlock
          label="Wishlist Requests"
          value={kpis.wishlistRequests}
          onClick={() => navigate(ROUTES.WISHLIST)}
        />
        <KpiBlock
          label="Screen Time Today"
          value={`${Math.round(kpis.screenTimeTodayMin)}m`}
          onClick={() => navigate(ROUTES.ANALYTICS_SCREEN_TIME)}
        />
        <KpiBlock label="Preview Sessions" value={kpis.packPreviewSessions} />
        <KpiBlock
          label="Preview Minutes"
          value={`${kpis.packPreviewMinutes}m`}
        />
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

      <div className="analytics__preview-grid">
        <PreviewList
          title="Top Previewed Packs"
          rows={topPreviewPacks}
          empty="No pack previews yet"
        />
        <PreviewList
          title="Top Previewed Models"
          rows={topPreviewWords}
          empty="No model previews yet"
        />
        <div className="analytics__preview-card">
          <p className="analytics__chart-title">Slow Preview Loads</p>
          {slowPreviewRows.length === 0 ? (
            <p className="analytics__empty">No slow previews logged</p>
          ) : (
            slowPreviewRows.map((row) => (
              <div key={row.id} className="analytics__preview-row">
                <span>
                  {row.packName} · {row.word}
                </span>
                <strong>{Math.round(row.durationMs / 1000)}s</strong>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="analytics__insights-grid">
        <div className="analytics__insights-card">
          <p className="analytics__chart-title">Content Signals</p>
          <p className="analytics__chart-sub">
            What kids are scanning, saving, and asking for right now
          </p>

          {insightsLoading ? (
            <p className="analytics__empty">Loading content signals…</p>
          ) : (
            <div className="analytics__insight-metrics">
              <Metric label="Words scanned" value={summary.totalScans} />
              <Metric label="Unknown scans" value={summary.totalUnknowns} />
              <Metric
                label="Wishlisted"
                value={summary.totalWishlistRequests}
              />
              <Metric label="Saved words" value={summary.totalSavedWords} />
              <Metric label="Model views" value={summary.totalModelViews} />
              <Metric
                label="Preview timeouts"
                value={summary.previewTimeouts}
              />
            </div>
          )}
        </div>

        <div className="analytics__insights-card">
          <p className="analytics__chart-title">Live Alerts</p>
          <p className="analytics__chart-sub">
            Milestones and inbox activity surfaced by the bell
          </p>
          {insightsLoading ? (
            <p className="analytics__empty">Loading alerts…</p>
          ) : alerts.length === 0 ? (
            <p className="analytics__empty">No alerts right now</p>
          ) : (
            <div className="analytics__alert-list">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`analytics__alert analytics__alert--${alert.tone}`}
                >
                  <strong>{alert.title}</strong>
                  <span>{alert.body}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <PreviewList
          title="Recent Scan Leaders"
          rows={topScannedWords}
          empty="No scan events yet"
        />
        <PreviewList
          title="Recent Unknown Words"
          rows={topUnknownWords}
          empty="No unknown words logged"
        />
        <PreviewList
          title="Top Wishlist Requests"
          rows={topWishlistedWords}
          empty="No wishlist requests yet"
        />
      </div>
    </div>
  );
};

interface PreviewListProps {
  title: string;
  rows: { label: string; count: number }[];
  empty: string;
}

const PreviewList: React.FC<PreviewListProps> = ({ title, rows, empty }) => (
  <div className="analytics__preview-card">
    <p className="analytics__chart-title">{title}</p>
    {rows.length === 0 ? (
      <p className="analytics__empty">{empty}</p>
    ) : (
      rows.map((row) => (
        <div key={row.label} className="analytics__preview-row">
          <span>{row.label}</span>
          <strong>{row.count}</strong>
        </div>
      ))
    )}
  </div>
);

interface KpiBlockProps {
  label: string;
  value: number | string;
  onClick?: () => void;
}

const KpiBlock: React.FC<KpiBlockProps> = ({ label, value, onClick }) => {
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="analytics__kpi analytics__kpi--clickable"
      >
        <span className="analytics__kpi-value">{value}</span>
        <span className="analytics__kpi-label">{label}</span>
        <span className="analytics__kpi-link">
          View details <ArrowRight size={12} />
        </span>
      </button>
    );
  }
  return (
    <div className="analytics__kpi">
      <span className="analytics__kpi-value">{value}</span>
      <span className="analytics__kpi-label">{label}</span>
    </div>
  );
};

const Metric: React.FC<{ label: string; value: number }> = ({
  label,
  value,
}) => (
  <div className="analytics__insight-metric">
    <strong>{value.toLocaleString('en-US')}</strong>
    <span>{label}</span>
  </div>
);
