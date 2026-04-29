import React from 'react';
import { Activity } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useHazardLog } from '../../hooks/useHazardLog';
import './HazardLogSection.css';

const fmt = (d: Date) =>
  d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

export const HazardLogSection: React.FC = () => {
  const { events, loading } = useHazardLog();

  return (
    <div className="hazard-log">
      <h2 className="hazard-log__title">
        <Activity size={16} /> Hazard Detection Log
      </h2>
      <p className="hazard-log__desc">
        Fired when <code>useHazardDetection</code> classifies a camera frame as hazardous.
        Use this to tune <code>HAZARD_KEYWORDS</code> and reduce false positives.
      </p>

      {loading ? <LoadingSpinner /> : events.length === 0 ? (
        <p className="hazard-log__empty">No hazard events logged yet.</p>
      ) : (
        <div className="hazard-log__table-wrap">
          <table className="hazard-log__table">
            <thead>
              <tr>
                <th>Label</th>
                <th>User UID</th>
                <th>Time</th>
                <th>Dismissed</th>
              </tr>
            </thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev.id} className="hazard-log__row">
                  <td className="hazard-log__label-cell">{ev.label}</td>
                  <td className="hazard-log__uid">{ev.uid}</td>
                  <td>{fmt(ev.detectedAt)}</td>
                  <td>{ev.dismissed ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
