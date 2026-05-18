import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../../../components/common/Badge';
import { ROUTES } from '../../../constants/routes';
import './RecentActivityCard.css';

interface ActivityRow {
  id: string;
  uid: string;
  email: string;
  username: string;
  word: string;
  game: string;
  timestamp: string;
  flagged: boolean;
}

interface RecentActivityCardProps {
  rows: ActivityRow[];
}

export const RecentActivityCard: React.FC<RecentActivityCardProps> = ({
  rows,
}) => (
  <div className="ra-card">
    <div className="ra-card__header">
      <div>
        <p className="ra-card__title">Recent Scan Activity</p>
        <p className="ra-card__subtitle">Latest word scans across all users</p>
      </div>
      <Link
        to={ROUTES.ANALYTICS_FLAGGED_EVENTS}
        className="ra-card__view-all"
      >
        View all <ArrowRight size={14} />
      </Link>
    </div>

    <table className="ra-card__table">
      <thead>
        <tr>
          <th>User</th>
          <th>Word</th>
          <th>Source</th>
          <th>Time</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={`${row.uid}-${row.id}`}>
            <td className="ra-card__email">
              <div className="ra-card__user-cell">
                <span className="ra-card__user-name">
                  {row.username || row.email}
                </span>
                {row.username && (
                  <span className="ra-card__user-email">{row.email}</span>
                )}
              </div>
            </td>
            <td>
              <strong>{row.word}</strong>
            </td>
            <td>
              <span className="ra-card__source">{row.game}</span>
            </td>
            <td className="ra-card__time">{row.timestamp}</td>
            <td>
              <Badge
                label={row.flagged ? 'Flagged' : 'Clean'}
                variant={row.flagged ? 'danger' : 'success'}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
