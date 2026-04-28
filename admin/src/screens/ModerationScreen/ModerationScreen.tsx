import React, { useState } from 'react';
import { Shield, X, Plus } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useModeration } from '../../hooks/useModeration';
import './ModerationScreen.css';

export const ModerationScreen: React.FC = () => {
  const {
    blocklist, flaggedEvents,
    loadingBlocklist, loadingFlags,
    addToBlocklist, removeFromBlocklist, reviewEvent,
  } = useModeration();

  const [newWord, setNewWord] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!newWord.trim()) return;
    setAdding(true);
    try {
      await addToBlocklist(newWord);
      setNewWord('');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="moderation">
      <PageHeader
        title="Moderation"
        subtitle="Global blocklist and flagged scan events"
      />

      <div className="moderation__section">
        <h2 className="moderation__section-title">
          <Shield size={16} /> Global Blocklist
        </h2>
        <p className="moderation__section-desc">
          Words on this list are blocked from triggering AR models across all users.
        </p>

        <div className="moderation__add-row">
          <input
            className="moderation__input"
            placeholder="Add a word to block…"
            value={newWord}
            onChange={e => setNewWord(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <Button icon={<Plus size={14} />} loading={adding} onClick={handleAdd}>
            Add
          </Button>
        </div>

        {loadingBlocklist ? <LoadingSpinner /> : (
          <div className="moderation__chips">
            {blocklist.length === 0 && (
              <p className="moderation__empty">No blocked words yet.</p>
            )}
            {blocklist.map(word => (
              <div key={word} className="moderation__chip">
                <span>{word}</span>
                <button
                  className="moderation__chip-remove"
                  onClick={() => removeFromBlocklist(word)}
                  aria-label={`Remove ${word}`}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="moderation__section">
        <h2 className="moderation__section-title">Flagged Events</h2>
        <p className="moderation__section-desc">
          Scan events that triggered the safety layer. Mark as reviewed once actioned.
        </p>

        {loadingFlags ? <LoadingSpinner /> : flaggedEvents.length === 0 ? (
          <p className="moderation__empty">No flagged events.</p>
        ) : (
          <div className="moderation__table-wrap">
            <table className="moderation__table">
              <thead>
                <tr><th>Word</th><th>User</th><th>Time</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {flaggedEvents.map(evt => (
                  <tr key={evt.id} className="moderation__row">
                    <td className="moderation__word">{evt.word}</td>
                    <td className="moderation__uid">{evt.userEmail || evt.uid}</td>
                    <td>{evt.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                    <td>
                      <Badge
                        label={evt.reviewed ? 'Reviewed' : 'Pending'}
                        variant={evt.reviewed ? 'success' : 'warning'}
                      />
                    </td>
                    <td>
                      {!evt.reviewed && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => reviewEvent(evt.id, evt.uid)}
                        >
                          Mark Reviewed
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
