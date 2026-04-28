import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Trash2, ArrowLeft } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { FormField } from '../../components/common/FormField';
import { ColorPicker } from '../../components/common/ColorPicker';
import { Toggle } from '../../components/common/Toggle';
import { FileUploader } from '../../components/common/FileUploader';
import { usePacks } from '../../hooks/usePacks';
import { ROUTES } from '../../constants/routes';
import type { Pack } from '../../types';
import './PackEditorScreen.css';

const EMPTY_PACK: Pack = {
  id: '', name: '', description: '', isPremium: false,
  isPublished: false, accentColor: '#FF6B6B', accentColorTo: '#F97316',
  wordCount: 0, words: [], coverImageUrl: '', coverImageRef: '',
};

export const PackEditorScreen: React.FC = () => {
  const { packId } = useParams<{ packId: string }>();
  const navigate = useNavigate();
  const { packs, savePack, deletePack, uploadCoverImage } = usePacks();
  const isNew = !packId || packId === 'new';

  const [form, setForm] = useState<Pack>(EMPTY_PACK);
  const [wordInput, setWordInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverProgress, setCoverProgress] = useState<number | null>(null);

  useEffect(() => {
    if (!isNew) {
      const existing = packs.find(p => p.id === packId);
      if (existing) setForm(existing);
    }
  }, [packs, packId, isNew]);

  const set = <K extends keyof Pack>(key: K, value: Pack[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const addWord = () => {
    const w = wordInput.trim().toLowerCase();
    if (!w || form.words.includes(w)) return;
    set('words', [...form.words, w]);
    setWordInput('');
  };

  const removeWord = (w: string) =>
    set('words', form.words.filter(x => x !== w));

  const handleCoverUpload = async (file: File) => {
    const id = form.id.trim() || 'unknown';
    const { url, path } = await uploadCoverImage(id, file, setCoverProgress);
    set('coverImageUrl', url);
    set('coverImageRef', path);
  };

  const handleSave = async () => {
    if (!form.id.trim()) { setError('Pack ID is required.'); return; }
    if (!form.name.trim()) { setError('Name is required.'); return; }
    setSaving(true);
    setError(null);
    try {
      await savePack({ ...form, wordCount: form.words.length });
      navigate(ROUTES.PACKS);
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!packId || isNew) return;
    if (!window.confirm(`Delete "${form.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deletePack(packId);
      navigate(ROUTES.PACKS);
    } catch {
      setError('Failed to delete.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="pack-editor">
      <PageHeader
        title={isNew ? 'New Pack' : `Edit: ${form.name}`}
        subtitle="Configure pack details, colours, and word list"
        actions={
          <div className="pack-editor__header-actions">
            <Button variant="ghost" icon={<ArrowLeft size={16} />} onClick={() => navigate(ROUTES.PACKS)}>
              Back
            </Button>
            {!isNew && (
              <Button variant="danger" icon={<Trash2 size={16} />} loading={deleting} onClick={handleDelete}>
                Delete
              </Button>
            )}
            <Button icon={<Save size={16} />} loading={saving} onClick={handleSave}>
              Save Pack
            </Button>
          </div>
        }
      />

      {error && <p className="pack-editor__error">{error}</p>}

      <div className="pack-editor__body">
        {/* Left column — details */}
        <div className="pack-editor__card">
          <h2 className="pack-editor__section-title">Details</h2>

          <FormField label="Pack ID" hint="Lowercase, no spaces. e.g. dinosaurs" required>
            <input
              className="form-input"
              value={form.id}
              onChange={e => set('id', e.target.value.toLowerCase().replace(/\s/g, '-'))}
              placeholder="dinosaurs"
              disabled={!isNew}
            />
          </FormField>

          <FormField label="Name" required>
            <input
              className="form-input"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Dinosaurs"
            />
          </FormField>

          <FormField label="Description">
            <textarea
              className="form-textarea"
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Prehistoric dinosaurs for young explorers"
            />
          </FormField>

          <div className="pack-editor__toggles">
            <FormField label="Premium Pack">
              <Toggle
                checked={form.isPremium}
                onChange={v => set('isPremium', v)}
                label={form.isPremium ? 'Premium (paid unlock)' : 'Free for all users'}
              />
            </FormField>
            <FormField label="Published">
              <Toggle
                checked={form.isPublished}
                onChange={v => set('isPublished', v)}
                label={form.isPublished ? 'Visible in app' : 'Draft — hidden from app'}
              />
            </FormField>
          </div>
        </div>

        {/* Middle column — colours */}
        <div className="pack-editor__card">
          <h2 className="pack-editor__section-title">Colours</h2>
          <p className="pack-editor__section-subtitle">Used for the pack card gradient in the app.</p>

          <div className="pack-editor__preview-gradient"
            style={{ background: `linear-gradient(135deg, ${form.accentColor}, ${form.accentColorTo})` }}
          />

          <FormField label="Accent Color (start)">
            <ColorPicker value={form.accentColor} onChange={v => set('accentColor', v)} />
          </FormField>

          <FormField label="Accent Color (end)">
            <ColorPicker value={form.accentColorTo} onChange={v => set('accentColorTo', v)} />
          </FormField>

          <h2 className="pack-editor__section-title" style={{ marginTop: 4 }}>Cover Art</h2>
          <p className="pack-editor__section-subtitle">PNG or JPG, 1:1 ratio recommended. Shown on the pack card.</p>

          {form.coverImageUrl && (
            <img
              src={form.coverImageUrl}
              alt="Cover art preview"
              className="pack-editor__cover-preview"
            />
          )}

          <FileUploader
            accept="image/png,image/jpeg,image/webp"
            label="PNG, JPG or WEBP, max 1 MB"
            currentUrl={form.coverImageUrl}
            onUpload={handleCoverUpload}
          />
          {coverProgress !== null && coverProgress < 100 && (
            <p className="pack-editor__progress">Uploading… {coverProgress}%</p>
          )}
        </div>

        {/* Right column — words */}
        <div className="pack-editor__card">
          <h2 className="pack-editor__section-title">
            Words
            <span className="pack-editor__word-count">{form.words.length}</span>
          </h2>
          <p className="pack-editor__section-subtitle">Each word must have a matching model entry.</p>

          <div className="pack-editor__word-input-row">
            <input
              className="form-input"
              value={wordInput}
              onChange={e => setWordInput(e.target.value)}
              placeholder="e.g. triceratops"
              onKeyDown={e => e.key === 'Enter' && addWord()}
            />
            <Button variant="secondary" size="sm" onClick={addWord}>Add</Button>
          </div>

          <div className="pack-editor__word-list">
            {form.words.length === 0 && (
              <p className="pack-editor__word-empty">No words added yet.</p>
            )}
            {form.words.map(w => (
              <div key={w} className="pack-editor__word-chip">
                <span>{w}</span>
                <button type="button" onClick={() => removeWord(w)} className="pack-editor__word-remove">×</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
