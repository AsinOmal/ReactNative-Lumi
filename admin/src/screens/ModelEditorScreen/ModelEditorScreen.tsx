import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Trash2, ArrowLeft } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { FormField } from '../../components/common/FormField';
import { Toggle } from '../../components/common/Toggle';
import { FileUploader } from '../../components/common/FileUploader';
import { useModels } from '../../hooks/useModels';
import { usePacks } from '../../hooks/usePacks';
import { ROUTES } from '../../constants/routes';
import type { ModelEntry } from '../../types';
import './ModelEditorScreen.css';

const EMPTY_MODEL: ModelEntry = {
  word: '', syllables: [], audioUrl: '', modelUrl: '',
  audioRef: '', modelRef: '', scale: 1, positionY: 0,
  packId: '', isCalibrated: false,
};

export const ModelEditorScreen: React.FC = () => {
  const { wordKey } = useParams<{ wordKey: string }>();
  const navigate = useNavigate();
  const { models, saveModel, deleteModel, uploadFile } = useModels();
  const { packs } = usePacks();
  const isNew = !wordKey || wordKey === 'new';

  const [form, setForm] = useState<ModelEntry>(EMPTY_MODEL);
  const [syllableInput, setSyllableInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [glbProgress, setGlbProgress] = useState<number | null>(null);
  const [audioProgress, setAudioProgress] = useState<number | null>(null);

  useEffect(() => {
    if (!isNew) {
      const existing = models.find(m => m.word === wordKey);
      if (existing) {
        setForm(existing);
        setSyllableInput(existing.syllables.join(', '));
      }
    }
  }, [models, wordKey, isNew]);

  const set = <K extends keyof ModelEntry>(key: K, value: ModelEntry[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleGlbUpload = async (file: File) => {
    const path = `models/${form.word || 'unknown'}.glb`;
    const { url } = await uploadFile(file, path, setGlbProgress);
    set('modelUrl', url);
    set('modelRef', path);
  };

  const handleAudioUpload = async (file: File) => {
    const path = `audio/${form.word || 'unknown'}.mp3`;
    const { url } = await uploadFile(file, path, setAudioProgress);
    set('audioUrl', url);
    set('audioRef', path);
  };

  const handleSave = async () => {
    if (!form.word.trim()) { setError('Word is required.'); return; }
    if (!form.packId) { setError('Please select a pack.'); return; }
    setSaving(true);
    setError(null);
    try {
      const syllables = syllableInput
        .split(',')
        .map(s => s.trim().toLowerCase())
        .filter(Boolean);
      await saveModel({ ...form, word: form.word.toLowerCase(), syllables });
      navigate(ROUTES.MODELS);
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!wordKey || isNew) return;
    if (!window.confirm(`Delete model "${wordKey}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteModel(wordKey);
      navigate(ROUTES.MODELS);
    } catch {
      setError('Failed to delete.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="model-editor">
      <PageHeader
        title={isNew ? 'New Model' : `Edit: ${form.word}`}
        subtitle="Upload 3D model and audio, set AR scale values"
        actions={
          <div className="model-editor__header-actions">
            <Button variant="ghost" icon={<ArrowLeft size={16} />} onClick={() => navigate(ROUTES.MODELS)}>
              Back
            </Button>
            {!isNew && (
              <Button variant="danger" icon={<Trash2 size={16} />} loading={deleting} onClick={handleDelete}>
                Delete
              </Button>
            )}
            <Button icon={<Save size={16} />} loading={saving} onClick={handleSave}>
              Save Model
            </Button>
          </div>
        }
      />

      {error && <p className="model-editor__error">{error}</p>}

      <div className="model-editor__body">
        {/* Left — word details */}
        <div className="model-editor__card">
          <h2 className="model-editor__section-title">Word Details</h2>

          <FormField label="Word" hint="Lowercase, single word. e.g. triceratops" required>
            <input
              className="form-input"
              value={form.word}
              onChange={e => set('word', e.target.value.toLowerCase().trim())}
              placeholder="triceratops"
              disabled={!isNew}
            />
          </FormField>

          <FormField label="Syllables" hint="Comma-separated. e.g. tri, cer, a, tops">
            <input
              className="form-input"
              value={syllableInput}
              onChange={e => setSyllableInput(e.target.value)}
              placeholder="tri, cer, a, tops"
            />
          </FormField>

          <FormField label="Pack" required>
            <select
              className="form-select"
              value={form.packId}
              onChange={e => set('packId', e.target.value)}
            >
              <option value="">Select a pack…</option>
              {packs.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </FormField>

          <div className="model-editor__ar-row">
            <FormField label="AR Scale" hint="Start at 0.004 for small objects">
              <input
                type="number"
                className="form-input"
                value={form.scale}
                step={0.001}
                min={0.0001}
                onChange={e => set('scale', parseFloat(e.target.value) || 1)}
              />
            </FormField>
            <FormField label="Position Y" hint="Vertical offset in AR">
              <input
                type="number"
                className="form-input"
                value={form.positionY}
                step={0.01}
                onChange={e => set('positionY', parseFloat(e.target.value) || 0)}
              />
            </FormField>
          </div>

          <FormField label="Calibration Status">
            <Toggle
              checked={form.isCalibrated}
              onChange={v => set('isCalibrated', v)}
              label={form.isCalibrated ? 'Scale confirmed on physical device' : 'Not yet calibrated on device'}
            />
          </FormField>
        </div>

        {/* Right — file uploads */}
        <div className="model-editor__card">
          <h2 className="model-editor__section-title">3D Model (GLB)</h2>
          <p className="model-editor__section-subtitle">Max 2 MB. Must be a GLB file.</p>
          <FileUploader
            accept=".glb"
            label=".glb file, max 2 MB"
            currentUrl={form.modelUrl}
            onUpload={handleGlbUpload}
          />
          {glbProgress !== null && glbProgress < 100 && (
            <p className="model-editor__progress">Uploading GLB… {glbProgress}%</p>
          )}
          {form.modelUrl && (
            <a href={form.modelUrl} target="_blank" rel="noreferrer" className="model-editor__file-link">
              View current GLB
            </a>
          )}

          <h2 className="model-editor__section-title" style={{ marginTop: 8 }}>Audio (MP3)</h2>
          <p className="model-editor__section-subtitle">Single spoken word, natural pace, no music.</p>
          <FileUploader
            accept=".mp3,audio/*"
            label=".mp3 file, mono 44.1kHz"
            currentUrl={form.audioUrl}
            onUpload={handleAudioUpload}
          />
          {audioProgress !== null && audioProgress < 100 && (
            <p className="model-editor__progress">Uploading audio… {audioProgress}%</p>
          )}
          {form.audioUrl && (
            <audio controls src={form.audioUrl} className="model-editor__audio-preview" />
          )}
        </div>
      </div>
    </div>
  );
};
