import React, { useMemo, useState } from 'react';
import { Plus, Box, ChevronDown, ChevronRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useModels } from '../../hooks/useModels';
import { usePacks } from '../../hooks/usePacks';
import { ROUTES } from '../../constants/routes';
import type { Pack, ModelEntry } from '../../types';
import './ModelsScreen.css';

type CategoryKey = 'bundled' | 'free' | 'premium';

const CATEGORY_ORDER: CategoryKey[] = ['bundled', 'free', 'premium'];
const CATEGORY_LABEL: Record<CategoryKey, string> = {
  bundled: 'Bundled Packs',
  free: 'Free Downloadable',
  premium: 'Premium',
};

const categoryOf = (pack: Pack): CategoryKey => {
  if (pack.isPremium) return 'premium';
  if (pack.packType === 'free') return 'free';
  return 'bundled';
};

const addModelHref = (packId: string): string =>
  `${ROUTES.MODEL_NEW}?packId=${encodeURIComponent(packId)}`;

export const ModelsScreen: React.FC = () => {
  const { models, loading } = useModels();
  const { packs } = usePacks();
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Group packs by category, with their models nested. Memoised so the tree
  // only rebuilds when packs / models change, not on every keystroke.
  const grouped = useMemo(() => {
    const modelsByPack = new Map<string, ModelEntry[]>();
    models.forEach((m) => {
      const arr = modelsByPack.get(m.packId) ?? [];
      arr.push(m);
      modelsByPack.set(m.packId, arr);
    });
    const byCategory: Record<CategoryKey, { pack: Pack; rows: ModelEntry[] }[]> = {
      bundled: [],
      free: [],
      premium: [],
    };
    packs.forEach((p) => {
      byCategory[categoryOf(p)].push({
        pack: p,
        rows: (modelsByPack.get(p.id) ?? []).sort((a, b) =>
          a.word.localeCompare(b.word)
        ),
      });
    });
    return byCategory;
  }, [packs, models]);

  // While searching, auto-expand any pack with a hit so the matching model is
  // visible without an extra click. Otherwise honour the user's expand state.
  const isExpanded = (packId: string, matched: boolean): boolean =>
    !!query.trim() ? matched : expanded.has(packId);

  const toggle = (packId: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(packId)) next.delete(packId);
      else next.add(packId);
      return next;
    });

  const q = query.trim().toLowerCase();
  const totalModels = models.length;

  return (
    <div className="models">
      <PageHeader
        title="Models"
        subtitle={`${totalModels} models across ${packs.length} packs`}
        actions={
          <Link to={ROUTES.MODEL_NEW}>
            <Button icon={<Plus size={16} />}>New Model</Button>
          </Link>
        }
      />

      <div className="models__search">
        <Search size={16} className="models__search-icon" />
        <input
          className="form-input models__search-input"
          placeholder="Search by word…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : packs.length === 0 ? (
        <EmptyState
          icon={<Box size={40} />}
          title="No packs yet"
          description="Create a pack first, then add models to it."
        />
      ) : (
        CATEGORY_ORDER.map((cat) => {
          const entries = grouped[cat];
          if (entries.length === 0) return null;
          return (
            <section key={cat} className="models__category">
              <header className="models__category-header">
                <h2 className="models__category-title">{CATEGORY_LABEL[cat]}</h2>
                <span className="models__category-count">
                  {entries.length} pack{entries.length === 1 ? '' : 's'}
                </span>
              </header>

              <div className="models__pack-list">
                {entries.map(({ pack, rows }) => {
                  const matchedRows = q
                    ? rows.filter((m) => m.word.includes(q))
                    : rows;
                  const matched = q ? matchedRows.length > 0 : false;
                  if (q && !matched) return null;
                  const open = isExpanded(pack.id, matched);
                  const display = q ? matchedRows : rows;

                  return (
                    <article key={pack.id} className="models__pack-card">
                      <button
                        type="button"
                        className="models__pack-row"
                        onClick={() => toggle(pack.id)}
                        aria-expanded={open}
                      >
                        {open ? (
                          <ChevronDown size={18} />
                        ) : (
                          <ChevronRight size={18} />
                        )}
                        <span className="models__pack-name">{pack.name}</span>
                        <span className="models__pack-meta">
                          {rows.length} model{rows.length === 1 ? '' : 's'} ·{' '}
                          {pack.wordCount} word
                          {pack.wordCount === 1 ? '' : 's'}
                        </span>
                        <Link
                          to={addModelHref(pack.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="models__pack-cta"
                        >
                          <Plus size={14} /> Add Model
                        </Link>
                      </button>

                      {open && (
                        <PackModelTable
                          rows={display}
                          packAddHref={addModelHref(pack.id)}
                        />
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
};

interface PackModelTableProps {
  rows: ModelEntry[];
  packAddHref: string;
}

const PackModelTable: React.FC<PackModelTableProps> = ({ rows, packAddHref }) => {
  if (rows.length === 0) {
    return (
      <div className="models__empty-pack">
        <p>No models in this pack yet.</p>
        <Link to={packAddHref}>
          <Button size="sm" icon={<Plus size={14} />}>
            Add first model
          </Button>
        </Link>
      </div>
    );
  }
  return (
    <div className="models__table-wrap">
      <table className="models__table">
        <thead>
          <tr>
            <th>Word</th>
            <th>Syllables</th>
            <th>Scale</th>
            <th>GLB</th>
            <th>Audio</th>
            <th>Calibrated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((m) => (
            <tr key={m.word} className="models__row">
              <td>
                <strong>{m.word}</strong>
              </td>
              <td className="models__syllables">
                {m.syllables.join(' · ') || '—'}
              </td>
              <td className="models__mono">{m.scale}</td>
              <td>
                <Badge
                  label={m.modelUrl ? 'Uploaded' : 'Missing'}
                  variant={m.modelUrl ? 'success' : 'danger'}
                />
              </td>
              <td>
                <Badge
                  label={m.audioUrl ? 'Uploaded' : 'Missing'}
                  variant={m.audioUrl ? 'success' : 'danger'}
                />
              </td>
              <td>
                <Badge
                  label={m.isCalibrated ? 'Yes' : 'No'}
                  variant={m.isCalibrated ? 'info' : 'neutral'}
                />
              </td>
              <td>
                <Link to={ROUTES.MODEL_EDIT.replace(':wordKey', m.word)}>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
