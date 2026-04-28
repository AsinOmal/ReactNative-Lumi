import React from 'react';
import { Users, BookOpen, Gamepad2, Trophy, ShieldAlert } from 'lucide-react';
import { StatCard } from '../../../components/common/StatCard';
import { colors } from '../../../constants/colors';
import type { DashboardStats } from '../../../types';
import './KpiRow.css';

interface KpiRowProps {
  stats: DashboardStats;
}

export const KpiRow: React.FC<KpiRowProps> = ({ stats }) => (
  <div className="kpi-row">
    <StatCard
      title="Total Users"
      subtitle="All Time"
      value={stats.totalUsers}
      detail={`New: ${stats.newUsersToday}`}
      icon={<Users size={22} />}
      accentColor={colors.accentBlue}
      accentBg={colors.accentBlueBg}
      trend={{ value: `+${stats.newUsersToday} Today`, positive: true }}
    />
    <StatCard
      title="Words Saved"
      subtitle="Cumulative"
      value={stats.wordsSaved}
      icon={<BookOpen size={22} />}
      accentColor={colors.accentGreen}
      accentBg={colors.accentGreenBg}
      trend={{ value: `+${stats.wordsSavedThisWeek} This Week`, positive: true }}
    />
    <StatCard
      title="Active Today"
      subtitle="Unique Users"
      value={stats.activeToday}
      icon={<Users size={22} />}
      accentColor={colors.accentAmber}
      accentBg={colors.accentAmberBg}
    />
    <StatCard
      title="Achievements"
      subtitle="Unlocked Total"
      value={stats.achievementsUnlocked}
      icon={<Trophy size={22} />}
      accentColor={colors.accentPurple}
      accentBg={colors.accentPurpleBg}
    />
    <StatCard
      title="Games Played"
      subtitle="All Time"
      value={stats.gamesPlayed}
      icon={<Gamepad2 size={22} />}
      accentColor={colors.accentTeal}
      accentBg={colors.accentTealBg}
    />
    <StatCard
      title="Flagged Events"
      subtitle="Unreviewed"
      value={stats.flaggedEvents}
      icon={<ShieldAlert size={22} />}
      accentColor={colors.accentRed}
      accentBg={colors.accentRedBg}
      trend={stats.flaggedEvents > 0 ? { value: 'Needs review', positive: false } : undefined}
    />
  </div>
);
