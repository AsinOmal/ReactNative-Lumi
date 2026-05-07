import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useUsers } from '../../hooks/useUsers';
import { ROUTES } from '../../constants/routes';
import type { AppUser } from '../../types';
import './UsersScreen.css';

const fmtDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const UsersScreen: React.FC = () => {
  const { users, loading, error, suspendUser } = useUsers();
  const [search, setSearch] = useState('');

  const q = search.toLowerCase();
  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(q) ||
    (u.displayName ?? '').toLowerCase().includes(q) ||
    (u.username ?? '').toLowerCase().includes(q),
  );

  return (
    <div className="users">
      <PageHeader
        title="Users"
        subtitle={`${users.length} registered accounts`}
      />

      <div className="users__toolbar">
        <div className="users__search">
          <Search size={14} className="users__search-icon" />
          <input
            className="users__search-input"
            placeholder="Search by username, name, or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <EmptyState icon={<Users size={40} />} title="Failed to load users" description={error} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Users size={40} />} title="No users found" description="Try adjusting your search." />
      ) : (
        <div className="users__table-wrap">
          <table className="users__table">
            <thead>
              <tr>
                <th>User</th>
                <th>Words</th>
                <th>Streak</th>
                <th>Last Active</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <UserRow key={u.uid} user={u} onToggleSuspend={suspendUser} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

interface UserRowProps {
  user: AppUser;
  onToggleSuspend: (uid: string, suspended: boolean) => Promise<void>;
}

const UserRow: React.FC<UserRowProps> = ({ user, onToggleSuspend }) => {
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    setBusy(true);
    try { await onToggleSuspend(user.uid, !user.suspended); }
    finally { setBusy(false); }
  };

  const displayLabel = user.username || user.displayName || '—';
  return (
    <tr className="users__row">
      <td>
        <div className="users__user-cell">
          <div className="users__avatar">{(displayLabel === '—' ? user.email : displayLabel)[0].toUpperCase()}</div>
          <div>
            <p className="users__name">{displayLabel}</p>
            <p className="users__email">{user.email}</p>
          </div>
        </div>
      </td>
      <td>{user.wordCount}</td>
      <td>{user.streak} days</td>
      <td>{fmtDate(user.lastActive)}</td>
      <td>
        <Badge
          label={user.suspended ? 'Suspended' : 'Active'}
          variant={user.suspended ? 'danger' : 'success'}
        />
      </td>
      <td>
        <div className="users__actions">
          <Link to={ROUTES.USER_DETAIL.replace(':uid', user.uid)}>
            <Button variant="ghost" size="sm">View</Button>
          </Link>
          <Button
            variant={user.suspended ? 'secondary' : 'danger'}
            size="sm"
            loading={busy}
            onClick={toggle}
          >
            {user.suspended ? 'Unsuspend' : 'Suspend'}
          </Button>
        </div>
      </td>
    </tr>
  );
};
