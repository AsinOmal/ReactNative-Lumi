import React from 'react';
import { KpiRow } from './components/KpiRow';
import { UserActivityCard } from './components/UserActivityCard';
import { TopWordsCard } from './components/TopWordsCard';
import { RecentActivityCard } from './components/RecentActivityCard';
import { PageHeader } from '../../components/common/PageHeader';
import { useDashboard } from '../../hooks/useDashboard';
import type { DashboardStats } from '../../types';
import './DashboardScreen.css';

const EMPTY_STATS: DashboardStats = {
  totalUsers: 0,
  newUsersToday: 0,
  activeToday: 0,
  wordsSaved: 0,
  wordsSavedThisWeek: 0,
  gamesPlayed: 0,
  achievementsUnlocked: 0,
  flaggedEvents: 0,
};

const TODAY = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

export const DashboardScreen: React.FC = () => {
  const { stats, recentActivity, topWords, loading } = useDashboard();

  return (
    <div className="dashboard">
      <PageHeader title="Dashboard" subtitle={TODAY} />

      {loading ? (
        <p className="dashboard__loading">Loading metrics…</p>
      ) : (
        <>
          <section aria-label="Key metrics">
            <p className="dashboard__section-label">Key Metrics</p>
            <KpiRow stats={stats ?? EMPTY_STATS} />
          </section>

          <section aria-label="Activity overview">
            <p className="dashboard__section-label">Activity Overview</p>
            <div className="dashboard__charts">
              <UserActivityCard data={[]} />
              <TopWordsCard data={topWords} />
            </div>
          </section>

          <section aria-label="Recent scans">
            <p className="dashboard__section-label">Recent Scans</p>
            <RecentActivityCard rows={recentActivity} />
          </section>
        </>
      )}
    </div>
  );
};
