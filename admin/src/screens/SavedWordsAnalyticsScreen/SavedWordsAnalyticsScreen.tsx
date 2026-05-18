// 📖 What this does:
// Drill-down view reached by clicking the "Words Saved" KPI on Analytics.
// Shows a per-word leaderboard so the admin can see *which* words kids are
// saving the most — not just a single global count.

import React, { useMemo, useState } from 'react';
import { BookmarkPlus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useSavedWordsAnalytics } from '../../hooks/useSavedWordsAnalytics';
import './SavedWordsAnalyticsScreen.css';

const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

export const SavedWordsAnalyticsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalSaves, loading, error } = useSavedWordsAnalytics();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) {
      return items;
    }
    return items.filter((i) => i.word.includes(q));
  }, [items, searchTerm]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="saved-words">
      <PageHeader
        title="Words Saved"
        subtitle={`${items.length} unique words · ${totalSaves} total saves across all users`}
        onBack={() => navigate(-1)}
      />

      {error && (
        <div className="saved-words__error">
          Could not load saved-words analytics: {error}
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState
          icon={<BookmarkPlus size={40} />}
          title="No saved words yet"
          description="Users haven't saved any words. When they tap the bookmark on a match, it'll appear here."
        />
      ) : (
        <>
          <div className="saved-words__searchbar">
            <Search size={16} className="saved-words__search-icon" />
            <input
              type="text"
              className="saved-words__search"
              placeholder="Search a word…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {filtered.length === 0 ? (
            <p className="saved-words__nomatch">
              No saved words match &ldquo;{searchTerm}&rdquo;.
            </p>
          ) : (
            <div className="saved-words__card">
              <table className="saved-words__table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Word</th>
                    <th>Saves</th>
                    <th>Unique Users</th>
                    <th>Last Saved</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, i) => (
                    <tr key={item.word} className="saved-words__row">
                      <td className="saved-words__rank">{i + 1}</td>
                      <td className="saved-words__word">{item.word}</td>
                      <td>
                        <span className="saved-words__count">
                          {item.saveCount}
                        </span>
                      </td>
                      <td className="saved-words__users">{item.uniqueUsers}</td>
                      <td className="saved-words__date">
                        {fmtDate(item.lastSavedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};
