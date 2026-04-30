import React, { useState } from 'react';
import { Bell, Send } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useNotifications } from '../../hooks/useNotifications';
import { BannerSection } from './BannerSection';
import './NotificationsScreen.css';

const fmt = (d: Date) =>
  d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

export const NotificationsScreen: React.FC = () => {
  const { broadcasts, loading, sending, sendBroadcast } = useNotifications();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      setError('Title and message are required.');
      return;
    }
    setError('');
    try {
      await sendBroadcast(title.trim(), body.trim());
      setTitle('');
      setBody('');
    } catch {
      setError('Failed to queue broadcast. Try again.');
    }
  };

  return (
    <div className="notifications">
      <PageHeader
        title="Notifications"
        subtitle="Broadcast push notifications to all users"
      />

      <div className="notifications__compose">
        <h2 className="notifications__section-title">New Broadcast</h2>
        <p className="notifications__section-desc">
          Broadcasts are queued in Firestore. A Cloud Function dispatches them to the
          <code>all-users</code> FCM topic automatically.
        </p>

        <div className="notifications__form">
          <label className="notifications__label">Title</label>
          <input
            className="notifications__input"
            placeholder="e.g. New Vegetables Pack is live!"
            value={title}
            maxLength={60}
            onChange={e => setTitle(e.target.value)}
          />

          <label className="notifications__label">Message</label>
          <textarea
            className="notifications__textarea"
            placeholder="e.g. Explore broccoli, carrot, and 8 more in AR."
            value={body}
            rows={3}
            maxLength={180}
            onChange={e => setBody(e.target.value)}
          />

          {error && <p className="notifications__error">{error}</p>}

          <div className="notifications__send-row">
            <span className="notifications__char-count">{body.length}/180</span>
            <Button icon={<Send size={14} />} loading={sending} onClick={handleSend}>
              Send to All Users
            </Button>
          </div>
        </div>
      </div>

      <div className="notifications__history">
        <h2 className="notifications__section-title">Broadcast History</h2>

        {loading ? (
          <LoadingSpinner />
        ) : broadcasts.length === 0 ? (
          <EmptyState
            icon={<Bell size={40} />}
            title="No broadcasts yet"
            description="Send your first notification above."
          />
        ) : (
          <div className="notifications__table-wrap">
            <table className="notifications__table">
              <thead>
                <tr><th>Title</th><th>Message</th><th>Sent</th><th>By</th><th>Status</th></tr>
              </thead>
              <tbody>
                {broadcasts.map(b => (
                  <tr key={b.id} className="notifications__row">
                    <td className="notifications__title-cell">{b.title}</td>
                    <td className="notifications__body-cell">{b.body}</td>
                    <td>{fmt(b.sentAt)}</td>
                    <td className="notifications__by">{b.sentBy}</td>
                    <td>
                      <Badge
                        label={b.status === 'sent' ? 'Sent' : 'Pending'}
                        variant={b.status === 'sent' ? 'success' : 'warning'}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <BannerSection />
    </div>
  );
};
