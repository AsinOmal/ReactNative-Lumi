import React, { useState } from 'react';
import { MessageSquare, Mail } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useFeedback } from '../../hooks/useFeedback';
import type { FeedbackItem } from '../../types';
import './FeedbackScreen.css';

const fmt = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const FeedbackScreen: React.FC = () => {
  const { items, unreadCount, loading, markRead } = useFeedback();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="feedback">
      <PageHeader
        title="Feedback"
        subtitle={unreadCount > 0 ? `${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}` : 'All caught up'}
      />

      {loading ? (
        <LoadingSpinner />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<MessageSquare size={40} />}
          title="No feedback yet"
          description="Feedback submitted from the app's Settings screen appears here."
        />
      ) : (
        <div className="feedback__list">
          {items.map(item => (
            <FeedbackRow
              key={item.id}
              item={item}
              isExpanded={expanded === item.id}
              onToggle={() => setExpanded(prev => prev === item.id ? null : item.id)}
              onMarkRead={markRead}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface FeedbackRowProps {
  item: FeedbackItem;
  isExpanded: boolean;
  onToggle: () => void;
  onMarkRead: (id: string) => Promise<void>;
}

const FeedbackRow: React.FC<FeedbackRowProps> = ({ item, isExpanded, onToggle, onMarkRead }) => {
  const [marking, setMarking] = useState(false);

  const handleMarkRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setMarking(true);
    try { await onMarkRead(item.id); }
    finally { setMarking(false); }
  };

  return (
    <div className={`feedback__row ${!item.isRead ? 'feedback__row--unread' : ''}`}>
      <div className="feedback__row-header" onClick={onToggle} role="button" tabIndex={0}>
        <div className="feedback__row-meta">
          <Mail size={14} className="feedback__mail-icon" />
          <span className="feedback__email">{item.email}</span>
          {!item.isRead && <Badge label="New" variant="purple" />}
          <span className="feedback__version">v{item.appVersion}</span>
        </div>
        <div className="feedback__row-right">
          <span className="feedback__date">{fmt(item.submittedAt)}</span>
          {!item.isRead && (
            <Button variant="ghost" size="sm" loading={marking} onClick={handleMarkRead}>
              Mark Read
            </Button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="feedback__message">
          <p>{item.message}</p>
          <p className="feedback__uid">UID: {item.uid}</p>
        </div>
      )}

      {!isExpanded && (
        <p className="feedback__preview" onClick={onToggle}>
          {item.message.slice(0, 120)}{item.message.length > 120 ? '…' : ''}
        </p>
      )}
    </div>
  );
};
