import React, { useState } from 'react';
import { Plus, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { ROUTES } from '../../constants/routes';
import type { Pack } from '../../types';
import './PacksScreen.css';

// Placeholder — replaced by usePacks() hook in Phase 9b
const MOCK_PACKS: Pack[] = [
  { id: 'fruits',     name: 'Fruits',     description: 'Common fruits with 3D models', isPremium: false, accentColor: '#FF6B6B', accentColorTo: '#FF8E53', wordCount: 10, words: [], isPublished: true },
  { id: 'vegetables', name: 'Vegetables', description: 'Garden vegetables',             isPremium: false, accentColor: '#4ECDC4', accentColorTo: '#22C55E', wordCount: 10, words: [], isPublished: false },
  { id: 'vehicles',   name: 'Vehicles',   description: 'Everyday vehicles',             isPremium: false, accentColor: '#4A90D9', accentColorTo: '#06B6D4', wordCount: 10, words: [], isPublished: false },
  { id: 'dinosaurs',  name: 'Dinosaurs',  description: 'Prehistoric dinosaurs',         isPremium: true,  accentColor: '#F59E0B', accentColorTo: '#D97706', wordCount: 10, words: [], isPublished: false },
  { id: 'space',      name: 'Space',      description: 'Objects in outer space',        isPremium: true,  accentColor: '#7C3AED', accentColorTo: '#4B4AEF', wordCount: 10, words: [], isPublished: false },
];

export const PacksScreen: React.FC = () => {
  const [packs] = useState<Pack[]>(MOCK_PACKS);

  return (
    <div className="packs">
      <PageHeader
        title="Packs"
        subtitle="Manage word packs and their content"
        actions={
          <Link to={ROUTES.PACK_NEW}>
            <Button icon={<Plus size={16} />}>New Pack</Button>
          </Link>
        }
      />

      {packs.length === 0 ? (
        <EmptyState
          icon={<Package size={40} />}
          title="No packs yet"
          description="Create your first pack to start adding content to the app."
          action={
            <Link to={ROUTES.PACK_NEW}>
              <Button icon={<Plus size={16} />}>Create Pack</Button>
            </Link>
          }
        />
      ) : (
        <div className="packs__table-wrap">
          <table className="packs__table">
            <thead>
              <tr>
                <th>Pack</th>
                <th>Words</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {packs.map((pack) => (
                <PackRow key={pack.id} pack={pack} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

interface PackRowProps {
  pack: Pack;
}

const PackRow: React.FC<PackRowProps> = ({ pack }) => (
  <tr className="packs__row">
    <td>
      <div className="packs__pack-cell">
        <div
          className="packs__accent-dot"
          style={{ background: `linear-gradient(135deg, ${pack.accentColor}, ${pack.accentColorTo})` }}
        />
        <div>
          <p className="packs__pack-name">{pack.name}</p>
          <p className="packs__pack-desc">{pack.description}</p>
        </div>
      </div>
    </td>
    <td>{pack.wordCount}</td>
    <td>
      <Badge label={pack.isPremium ? 'Premium' : 'Free'} variant={pack.isPremium ? 'purple' : 'success'} />
    </td>
    <td>
      <Badge label={pack.isPublished ? 'Published' : 'Draft'} variant={pack.isPublished ? 'info' : 'neutral'} />
    </td>
    <td>
      <div className="packs__actions">
        <Link to={ROUTES.PACK_EDIT.replace(':packId', pack.id)}>
          <Button variant="ghost" size="sm">Edit</Button>
        </Link>
      </div>
    </td>
  </tr>
);
