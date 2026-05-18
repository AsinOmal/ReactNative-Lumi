// 📖 What this does:
// Drill-down reached by clicking the "Games Played" KPI on Analytics. Lists
// each game by unique player count, with a Most-Played / Least-Played sort
// toggle. Caveat surfaced in the empty state: games that don't persist
// gameProgress to Firestore won't appear here.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import {
  useGamesAnalytics,
  GAME_DISPLAY,
  type GameSortMode,
} from '../../hooks/useGamesAnalytics';
import './GamesAnalyticsScreen.css';

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

export const GamesAnalyticsScreen: React.FC = () => {
  const navigate = useNavigate();
  const [sortMode, setSortMode] = useState<GameSortMode>('most');
  const { items, totalPlayers, loading, error } = useGamesAnalytics(sortMode);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="games-analytics">
      <PageHeader
        title="Games Played"
        subtitle={`${items.length} games tracked · ${totalPlayers} total player-game pairs`}
        onBack={() => navigate(-1)}
      />

      {error && (
        <div className="games-analytics__error">
          Could not load games analytics: {error}
        </div>
      )}

      <div className="games-analytics__filters">
        <button
          type="button"
          onClick={() => setSortMode('most')}
          className={
            sortMode === 'most'
              ? 'games-analytics__filter games-analytics__filter--active'
              : 'games-analytics__filter'
          }
        >
          Most Played
        </button>
        <button
          type="button"
          onClick={() => setSortMode('least')}
          className={
            sortMode === 'least'
              ? 'games-analytics__filter games-analytics__filter--active'
              : 'games-analytics__filter'
          }
        >
          Least Played
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<Gamepad2 size={40} />}
          title="No game progress yet"
          description="When users play a game that persists progress to Firestore, it'll appear here. Games that only run in-memory (no save) won't be tracked."
        />
      ) : (
        <div className="games-analytics__card">
          <table className="games-analytics__table">
            <thead>
              <tr>
                <th>#</th>
                <th>Game</th>
                <th>Players</th>
                <th>Last Played</th>
              </tr>
            </thead>
            <tbody>
              {items.map((g, i) => (
                <tr key={g.gameId} className="games-analytics__row">
                  <td className="games-analytics__rank">{i + 1}</td>
                  <td>
                    <div className="games-analytics__title">
                      {GAME_DISPLAY[g.gameId] ?? g.gameId}
                    </div>
                    <div className="games-analytics__id">{g.gameId}</div>
                  </td>
                  <td>
                    <span className="games-analytics__count">
                      {g.players}
                    </span>
                  </td>
                  <td className="games-analytics__date">
                    {fmtRel(g.lastPlayedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
