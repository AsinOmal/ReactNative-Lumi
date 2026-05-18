// 📖 What this does:
// Drill-down reached by clicking the "Achievements" KPI on Analytics. Shows
// each achievement ranked by how many times it's been unlocked across all
// users, plus unique unlocker count and last-unlocked timestamp.

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useAchievementsAnalytics } from '../../hooks/useAchievementsAnalytics';
import { ADMIN_ACHIEVEMENTS } from '../../constants/achievements';
import './AchievementsAnalyticsScreen.css';

const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

export const AchievementsAnalyticsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalUnlocks, loading, error } = useAchievementsAnalytics();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="achievements-analytics">
      <PageHeader
        title="Achievements"
        subtitle={`${items.length} unique achievements · ${totalUnlocks} total unlocks across all users`}
        onBack={() => navigate(-1)}
      />

      {error && (
        <div className="achievements-analytics__error">
          Could not load achievements analytics: {error}
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState
          icon={<Trophy size={40} />}
          title="No achievements unlocked yet"
          description="When users earn achievements in the mobile app, they'll appear here ranked by popularity."
        />
      ) : (
        <div className="achievements-analytics__card">
          <table className="achievements-analytics__table">
            <thead>
              <tr>
                <th>#</th>
                <th>Achievement</th>
                <th>Unlocks</th>
                <th>Unique Users</th>
                <th>Last Unlocked</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => {
                const def = ADMIN_ACHIEVEMENTS[item.achievementId];
                return (
                  <tr
                    key={item.achievementId}
                    className="achievements-analytics__row"
                  >
                    <td className="achievements-analytics__rank">{i + 1}</td>
                    <td>
                      <div className="achievements-analytics__title">
                        {def?.title ?? item.achievementId}
                      </div>
                      {def && (
                        <div className="achievements-analytics__desc">
                          {def.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="achievements-analytics__count">
                        {item.unlockCount}
                      </span>
                    </td>
                    <td className="achievements-analytics__sub">
                      {item.uniqueUsers}
                    </td>
                    <td className="achievements-analytics__date">
                      {fmtDate(item.lastUnlockedAt)}
                    </td>
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
