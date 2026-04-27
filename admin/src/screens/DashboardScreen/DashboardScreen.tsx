import React, { useState } from 'react';
import { KpiRow } from './components/KpiRow';
import { UserActivityCard } from './components/UserActivityCard';
import { TopWordsCard } from './components/TopWordsCard';
import { RecentActivityCard } from './components/RecentActivityCard';
import { PageHeader } from '../../components/common/PageHeader';
import type { DashboardStats } from '../../types';
import './DashboardScreen.css';

// Placeholder data — replaced by real Firestore queries in Phase 9c
const MOCK_STATS: DashboardStats = {
  totalUsers: 284,
  newUsersToday: 12,
  activeToday: 47,
  wordsSaved: 3821,
  wordsSavedThisWeek: 318,
  gamesPlayed: 1205,
  achievementsUnlocked: 642,
  flaggedEvents: 3,
};

const MOCK_ACTIVITY_DATA = Array.from({ length: 14 }, (_, i) => ({
  date: `Apr ${i + 14}`,
  activeUsers: Math.floor(Math.random() * 60) + 20,
  newUsers: Math.floor(Math.random() * 15) + 2,
}));

const MOCK_TOP_WORDS = [
  { word: 'apple',      count: 412 },
  { word: 'banana',     count: 388 },
  { word: 'orange',     count: 301 },
  { word: 'strawberry', count: 275 },
  { word: 'mango',      count: 248 },
  { word: 'pineapple',  count: 210 },
  { word: 'grape',      count: 198 },
  { word: 'watermelon', count: 167 },
];

const MOCK_RECENT_ACTIVITY = [
  { uid: '1', email: 'parent@example.com',  word: 'apple',      game: 'AR Word Find', timestamp: '2 min ago',  flagged: false },
  { uid: '2', email: 'learner@example.com', word: 'banana',     game: 'Scan',         timestamp: '5 min ago',  flagged: false },
  { uid: '3', email: 'user3@example.com',   word: 'fire',       game: 'Scan',         timestamp: '11 min ago', flagged: true  },
  { uid: '4', email: 'user4@example.com',   word: 'orange',     game: 'Make a Meal',  timestamp: '18 min ago', flagged: false },
  { uid: '5', email: 'user5@example.com',   word: 'strawberry', game: 'AR Word Find', timestamp: '25 min ago', flagged: false },
];

export const DashboardScreen: React.FC = () => {
  const [stats] = useState<DashboardStats>(MOCK_STATS);

  return (
    <div className="dashboard">
      <PageHeader
        title="Dashboard"
        subtitle="Platform overview and key metrics"
      />

      <KpiRow stats={stats} />

      <div className="dashboard__charts">
        <UserActivityCard data={MOCK_ACTIVITY_DATA} />
        <TopWordsCard data={MOCK_TOP_WORDS} />
      </div>

      <RecentActivityCard rows={MOCK_RECENT_ACTIVITY} />
    </div>
  );
};
