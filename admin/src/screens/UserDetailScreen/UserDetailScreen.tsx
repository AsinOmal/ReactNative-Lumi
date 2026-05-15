import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useUserDetail } from '../../hooks/useUserDetail';
import { ROUTES } from '../../constants/routes';
import './UserDetailScreen.css';

const fmt = (d: Date) =>
  d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

export const UserDetailScreen: React.FC = () => {
  const { uid = '' } = useParams<{ uid: string }>();
  const { detail, loading, error } = useUserDetail(uid);

  if (loading) {
    return <LoadingSpinner />;
  }
  if (error || !detail) {
    return (
      <EmptyState
        icon={<User size={40} />}
        title="User not found"
        description={error ?? ''}
      />
    );
  }

  return (
    <div className="user-detail">
      <PageHeader
        title={detail.username || detail.displayName || detail.email}
        subtitle={detail.email}
        actions={
          <Link to={ROUTES.USERS}>
            <Button variant="ghost" icon={<ArrowLeft size={14} />}>
              Back to Users
            </Button>
          </Link>
        }
      />

      <div className="user-detail__grid">
        <div className="user-detail__card">
          <h3 className="user-detail__card-title">Profile</h3>
          <dl className="user-detail__dl">
            <dt>UID</dt>
            <dd className="user-detail__mono">{detail.uid}</dd>
            <dt>Username</dt>
            <dd>{detail.username || '—'}</dd>
            <dt>Display Name</dt>
            <dd>{detail.displayName || '—'}</dd>
            <dt>Email</dt>
            <dd>{detail.email}</dd>
            <dt>Joined</dt>
            <dd>{fmt(detail.createdAt)}</dd>
            <dt>Last Active</dt>
            <dd>{fmt(detail.lastActive)}</dd>
            <dt>Status</dt>
            <dd>
              <Badge
                label={detail.suspended ? 'Suspended' : 'Active'}
                variant={detail.suspended ? 'danger' : 'success'}
              />
            </dd>
          </dl>
        </div>

        <div className="user-detail__card">
          <h3 className="user-detail__card-title">Stats</h3>
          <div className="user-detail__stats">
            <StatBlock label="Words Scanned" value={detail.wordCount} />
            <StatBlock label="Words Saved" value={detail.savedWordCount} />
            <StatBlock label="Achievements" value={detail.achievementCount} />
            <StatBlock label="Day Streak" value={detail.streak} />
          </div>
        </div>
      </div>

      <div className="user-detail__card">
        <h3 className="user-detail__card-title">Recent Activity</h3>
        {detail.recentActivity.length === 0 ? (
          <p className="user-detail__empty">No activity recorded yet.</p>
        ) : (
          <table className="user-detail__table">
            <thead>
              <tr>
                <th>Word</th>
                <th>Source</th>
                <th>Time</th>
                <th>Flag</th>
              </tr>
            </thead>
            <tbody>
              {detail.recentActivity.map((entry) => (
                <tr
                  key={entry.id}
                  className={entry.flagged ? 'user-detail__row--flagged' : ''}
                >
                  <td className="user-detail__word">{entry.word}</td>
                  <td>{entry.source || '—'}</td>
                  <td>{fmt(entry.timestamp)}</td>
                  <td>
                    {entry.flagged ? (
                      <Badge label="Flagged" variant="danger" />
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const StatBlock: React.FC<{ label: string; value: number }> = ({
  label,
  value,
}) => (
  <div className="user-detail__stat">
    <span className="user-detail__stat-value">{value}</span>
    <span className="user-detail__stat-label">{label}</span>
  </div>
);
