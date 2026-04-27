import React, { useState } from 'react';
import { Plus, Box } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useModels } from '../../hooks/useModels';
import { usePacks } from '../../hooks/usePacks';
import { ROUTES } from '../../constants/routes';
import './ModelsScreen.css';

export const ModelsScreen: React.FC = () => {
  const { models, loading } = useModels();
  const { packs } = usePacks();
  const [filterPack, setFilterPack] = useState('');

  const packMap = Object.fromEntries(packs.map(p => [p.id, p.name]));
  const filtered = filterPack ? models.filter(m => m.packId === filterPack) : models;

  return (
    <div className="models">
      <PageHeader
        title="Models"
        subtitle="3D GLB assets and audio files for AR display"
        actions={
          <Link to={ROUTES.MODEL_NEW}>
            <Button icon={<Plus size={16} />}>New Model</Button>
          </Link>
        }
      />

      <div className="models__filters">
        <select
          className="form-select models__filter-select"
          value={filterPack}
          onChange={e => setFilterPack(e.target.value)}
        >
          <option value="">All packs</option>
          {packs.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <span className="models__count">{filtered.length} models</span>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Box size={40} />}
          title="No models yet"
          description="Create a model entry and upload a GLB and MP3 to make it available in the app."
          action={
            <Link to={ROUTES.MODEL_NEW}>
              <Button icon={<Plus size={16} />}>New Model</Button>
            </Link>
          }
        />
      ) : (
        <div className="models__table-wrap">
          <table className="models__table">
            <thead>
              <tr>
                <th>Word</th>
                <th>Syllables</th>
                <th>Pack</th>
                <th>Scale</th>
                <th>GLB</th>
                <th>Audio</th>
                <th>Calibrated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.word} className="models__row">
                  <td><strong>{m.word}</strong></td>
                  <td className="models__syllables">{m.syllables.join(' · ') || '—'}</td>
                  <td>{packMap[m.packId] ?? m.packId}</td>
                  <td className="models__mono">{m.scale}</td>
                  <td>
                    <Badge label={m.modelUrl ? 'Uploaded' : 'Missing'} variant={m.modelUrl ? 'success' : 'danger'} />
                  </td>
                  <td>
                    <Badge label={m.audioUrl ? 'Uploaded' : 'Missing'} variant={m.audioUrl ? 'success' : 'danger'} />
                  </td>
                  <td>
                    <Badge label={m.isCalibrated ? 'Yes' : 'No'} variant={m.isCalibrated ? 'info' : 'neutral'} />
                  </td>
                  <td>
                    <Link to={ROUTES.MODEL_EDIT.replace(':wordKey', m.word)}>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </Link>
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
