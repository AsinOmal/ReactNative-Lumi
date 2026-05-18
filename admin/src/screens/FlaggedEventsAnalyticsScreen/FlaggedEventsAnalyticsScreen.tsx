// 📖 What this does:
// Drill-down reached by clicking the "Flagged Events" KPI (and from the
// dashboard "View All" link on Recent Scan Activity). Two views in one
// screen: a top-flagged-words leaderboard so the admin can see WHICH words
// dominate, and a recent-events table for case-by-case review.

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flag } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import { useFlaggedEventsAnalytics } from '../../hooks/useFlaggedEventsAnalytics';
import { ROUTES } from '../../constants/routes';
import './FlaggedEventsAnalyticsScreen.css';

const fmtRel = (d: Date) => {
  const ms = Date.now() - d.getTime();
  if (ms < 60_000) return 'just now';
  const min = Math.round(ms / 60_000);
  if (min < 60) return `${min} min ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  return `${day}d ago`;
};

export const FlaggedEventsAnalyticsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { topWords, recent, totalCount, loading, error } =
    useFlaggedEventsAnalytics();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flagged-events">
      <PageHeader
        title="Flagged Events"
        subtitle={`${totalCount} total · ${topWords.length} distinct flagged words`}
        onBack={() => navigate(-1)}
      />

      {error && (
        <div className="flagged-events__error">
          Could not load flagged-events analytics: {error}
        </div>
      )}

      {totalCount === 0 ? (
        <EmptyState
          icon={<Flag size={40} />}
          title="No flagged events yet"
          description="When the OCR detects a blocklisted word, the event is logged here. Empty means the blocklist isn't catching anything — that's good news."
        />
      ) : (
        <>
          <section className="flagged-events__section">
            <h2 className="flagged-events__section-title">
              Top Flagged Words
            </h2>
            <p className="flagged-events__section-sub">
              Aggregated across all users; click a row to see the global
              blocklist editor.
            </p>
            <div className="flagged-events__card">
              <table className="flagged-events__table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Word</th>
                    <th>Flags</th>
                    <th>Unique Users</th>
                  </tr>
                </thead>
                <tbody>
                  {topWords.slice(0, 20).map((w, i) => (
                    <tr key={w.word} className="flagged-events__row">
                      <td className="flagged-events__rank">{i + 1}</td>
                      <td className="flagged-events__word">{w.word}</td>
                      <td>
                        <span className="flagged-events__count">
                          {w.count}
                        </span>
                      </td>
                      <td className="flagged-events__sub">{w.uniqueUsers}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="flagged-events__section">
            <h2 className="flagged-events__section-title">Recent Events</h2>
            <p className="flagged-events__section-sub">
              Last {recent.length} flagged events. Click the user-id chip to
              open the user&apos;s profile.
            </p>
            <div className="flagged-events__card">
              <table className="flagged-events__table">
                <thead>
                  <tr>
                    <th>Word</th>
                    <th>User</th>
                    <th>Source</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((e) => (
                    <tr key={e.id} className="flagged-events__row">
                      <td className="flagged-events__word">{e.word}</td>
                      <td className="flagged-events__uid">
                        <Link
                          to={ROUTES.USER_DETAIL.replace(':uid', e.uid)}
                          className="flagged-events__uid-link"
                        >
                          {e.uid.slice(0, 8)}…
                        </Link>
                      </td>
                      <td className="flagged-events__sub">{e.source}</td>
                      <td className="flagged-events__date">
                        {fmtRel(e.timestamp)}
                      </td>
                      <td>
                        <Badge
                          label={e.reviewed ? 'Reviewed' : 'Open'}
                          variant={e.reviewed ? 'success' : 'danger'}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
};
