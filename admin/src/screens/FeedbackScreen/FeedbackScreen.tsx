import React, { useState } from 'react';
import { AlertTriangle, Mail, MessageSquare } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useFeedback } from '../../hooks/useFeedback';
import type { FeedbackItem } from '../../types';
import './FeedbackScreen.css';

const fmt = (d: Date) =>
  d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

export const FeedbackScreen: React.FC = () => {
  const { items, unreadCount, loading, markRead } = useFeedback();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [tab, setTab] = useState<'feedback' | 'model_report'>('feedback');
  const feedbackItems = items.filter((item) => item.type === 'feedback');
  const reportItems = items.filter((item) => item.type === 'model_report');
  const visibleItems = tab === 'feedback' ? feedbackItems : reportItems;
  const unreadReports = reportItems.filter((item) => !item.isRead).length;
  const unreadFeedback = feedbackItems.filter((item) => !item.isRead).length;

  return (
    <div className="feedback">
      <PageHeader
        title="Support Inbox"
        subtitle={
          unreadCount > 0
            ? `${unreadCount} unread item${unreadCount !== 1 ? 's' : ''}`
            : 'All caught up'
        }
      />

      <div className="feedback__tabs">
        <button
          type="button"
          className={`feedback__tab ${
            tab === 'feedback' ? 'feedback__tab--active' : ''
          }`}
          onClick={() => setTab('feedback')}
        >
          <MessageSquare size={16} />
          Feedback
          {unreadFeedback > 0 && (
            <Badge label={`${unreadFeedback}`} variant="purple" />
          )}
        </button>
        <button
          type="button"
          className={`feedback__tab ${
            tab === 'model_report' ? 'feedback__tab--active' : ''
          }`}
          onClick={() => setTab('model_report')}
        >
          <AlertTriangle size={16} />
          Model Reports
          {unreadReports > 0 && (
            <Badge label={`${unreadReports}`} variant="purple" />
          )}
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : visibleItems.length === 0 ? (
        <EmptyState
          icon={
            tab === 'feedback' ? (
              <MessageSquare size={40} />
            ) : (
              <AlertTriangle size={40} />
            )
          }
          title={
            tab === 'feedback' ? 'No feedback yet' : 'No model reports yet'
          }
          description={
            tab === 'feedback'
              ? "Feedback submitted from the app's Settings screen appears here."
              : 'Model load reports from pack previews appear here.'
          }
        />
      ) : (
        <div className="feedback__list">
          {visibleItems.map((item) => (
            <FeedbackRow
              key={item.id}
              item={item}
              isExpanded={expanded === item.id}
              onToggle={() =>
                setExpanded((prev) => (prev === item.id ? null : item.id))
              }
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

const FeedbackRow: React.FC<FeedbackRowProps> = ({
  item,
  isExpanded,
  onToggle,
  onMarkRead,
}) => {
  const [marking, setMarking] = useState(false);

  const handleMarkRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setMarking(true);
    try {
      await onMarkRead(item.id);
    } finally {
      setMarking(false);
    }
  };

  return (
    <div
      className={`feedback__row ${!item.isRead ? 'feedback__row--unread' : ''}`}
    >
      <div
        className="feedback__row-header"
        onClick={onToggle}
        role="button"
        tabIndex={0}
      >
        <div className="feedback__row-meta">
          {item.type === 'model_report' ? (
            <AlertTriangle size={14} className="feedback__mail-icon" />
          ) : (
            <Mail size={14} className="feedback__mail-icon" />
          )}
          <span className="feedback__email">{item.email}</span>
          <Badge
            label={item.type === 'model_report' ? 'Model Report' : 'Feedback'}
            variant={item.type === 'model_report' ? 'warning' : 'purple'}
          />
          {!item.isRead && <Badge label="New" variant="purple" />}
          <span className="feedback__version">v{item.appVersion}</span>
        </div>
        <div className="feedback__row-right">
          <span className="feedback__date">{fmt(item.submittedAt)}</span>
          {!item.isRead && (
            <Button
              variant="ghost"
              size="sm"
              loading={marking}
              onClick={handleMarkRead}
            >
              Mark Read
            </Button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="feedback__message">
          {item.type === 'model_report' && (
            <div className="feedback__report-grid">
              <Info
                label="Pack"
                value={item.packName ?? item.packId ?? 'Unknown'}
              />
              <Info label="Word" value={item.word ?? 'Unknown'} />
              <Info label="Reason" value={item.reason ?? 'Unknown'} />
              <Info
                label="Load time"
                value={
                  item.durationMs
                    ? `${Math.round(item.durationMs / 1000)}s`
                    : 'n/a'
                }
              />
            </div>
          )}
          <p>{item.message}</p>
          <p className="feedback__uid">UID: {item.uid}</p>
        </div>
      )}

      {!isExpanded && (
        <p className="feedback__preview" onClick={onToggle}>
          {item.message.slice(0, 120)}
          {item.message.length > 120 ? '…' : ''}
        </p>
      )}
    </div>
  );
};

const Info: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="feedback__info">
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);
