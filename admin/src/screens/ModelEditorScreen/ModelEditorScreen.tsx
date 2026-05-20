import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Save, Trash2, ArrowLeft, Plus, CheckCircle2 } from 'lucide-react';
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
  word: '',
  syllables: [],
  audioUrl: '',
  modelUrl: '',
  audioRef: '',
  modelRef: '',
  scale: 1,
  positionY: 0,
  positionZ: -1.0,
  packId: '',
  isCalibrated: false,
  sinhalaLabel: '',
};

export const ModelEditorScreen: React.FC = () => {
  const { wordKey } = useParams<{ wordKey: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { models, saveModel, deleteModel, uploadFile } = useModels();
  const { packs, bumpAssetVersion } = usePacks();
  const isNew = !wordKey || wordKey === 'new';
  // Pack pre-fill from query string — set when the user clicked "Add Model"
  // inside a specific pack on the Models list, so they don't have to re-pick.
  const prefilledPackId = searchParams.get('packId') ?? '';

  const [form, setForm] = useState<ModelEntry>(() =>
    isNew && prefilledPackId
      ? { ...EMPTY_MODEL, packId: prefilledPackId }
      : EMPTY_MODEL
  );
  const [syllableInput, setSyllableInput] = useState('');
  // Number inputs are kept as strings while focused so users can type partial
  // values like "0" or "0." without the previous `parseFloat() || 1` snap-back.
  const [scaleInput, setScaleInput] = useState(String(EMPTY_MODEL.scale));
  const [positionYInput, setPositionYInput] = useState(
    String(EMPTY_MODEL.positionY)
  );
  const [positionZInput, setPositionZInput] = useState(
    String(EMPTY_MODEL.positionZ ?? -1.0)
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [glbProgress, setGlbProgress] = useState<number | null>(null);
  const [audioProgress, setAudioProgress] = useState<number | null>(null);
  // Transient "Saved ✓" indicator. We stay on the page after Save so the user
  // can continue calibrating; the flash gives feedback without yanking nav.
  const [savedFlash, setSavedFlash] = useState(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showSavedFlash = () => {
    setSavedFlash(true);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setSavedFlash(false), 1800);
  };
  useEffect(
    () => () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    },
    []
  );

  useEffect(() => {
    if (!isNew) {
      const existing = models.find((m) => m.word === wordKey);
      if (existing) {
        setForm({ ...existing, positionZ: existing.positionZ ?? -1.0 });
        setSyllableInput(existing.syllables.join(', '));
        setScaleInput(String(existing.scale));
        setPositionYInput(String(existing.positionY));
        setPositionZInput(String(existing.positionZ ?? -1.0));
      }
    }
  }, [models, wordKey, isNew]);

  const set = <K extends keyof ModelEntry>(key: K, value: ModelEntry[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScaleInput(e.target.value);
    const n = parseFloat(e.target.value);
    if (Number.isFinite(n) && n > 0) {
      set('scale', n);
    }
  };
  const onScaleBlur = () => {
    const n = parseFloat(scaleInput);
    if (!Number.isFinite(n) || n <= 0) {
      setScaleInput(String(form.scale));
    }
  };

  const onPositionYChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPositionYInput(e.target.value);
    const n = parseFloat(e.target.value);
    if (Number.isFinite(n)) {
      set('positionY', n);
    }
  };
  const onPositionYBlur = () => {
    const n = parseFloat(positionYInput);
    if (!Number.isFinite(n)) {
      setPositionYInput(String(form.positionY));
    }
  };

  const onPositionZChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPositionZInput(e.target.value);
    const n = parseFloat(e.target.value);
    if (Number.isFinite(n)) {
      set('positionZ', n);
    }
  };
  const onPositionZBlur = () => {
    const n = parseFloat(positionZInput);
    if (!Number.isFinite(n)) {
      setPositionZInput(String(form.positionZ ?? -1.0));
    }
  };

  // After a GLB or audio file is replaced, bump the parent pack's
  // assetVersion so devices treat the new bytes as fresh content. Calibration
  // metadata (scale, positionY/Z) is keyed against specific GLB geometry —
  // without an auto-bump, devices would serve cached calibration against
  // the new geometry and models would render at wrong sizes.
  const bumpParentPack = async () => {
    if (!form.packId) {
      return;
    }
    try {
      await bumpAssetVersion(form.packId);
    } catch (e) {
      console.warn('[ModelEditor] bumpAssetVersion failed:', e);
    }
  };

  const handleGlbUpload = async (file: File) => {
    const path = `models/${form.word || 'unknown'}.glb`;
    const { url } = await uploadFile(file, path, setGlbProgress);
    set('modelUrl', url);
    set('modelRef', path);
    await bumpParentPack();
  };

  const handleAudioUpload = async (file: File) => {
    const path = `audio/${form.word || 'unknown'}.mp3`;
    const { url } = await uploadFile(file, path, setAudioProgress);
    set('audioUrl', url);
    set('audioRef', path);
    await bumpParentPack();
  };

  const saveFormCore = async (): Promise<string | null> => {
    if (!form.word.trim()) {
      setError('Word is required.');
      return null;
    }
    if (!form.packId) {
      setError('Please select a pack.');
      return null;
    }
    setError(null);
    const syllables = syllableInput
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const word = form.word.toLowerCase();
    await saveModel({ ...form, word, syllables });
    return word;
  };

  // Save and stay — for calibration loops. New models swap URL to the edit
  // route so the next save targets the same record instead of re-creating.
  const handleSave = async () => {
    setSaving(true);
    try {
      const word = await saveFormCore();
      if (!word) return;
      if (isNew) {
        navigate(ROUTES.MODEL_EDIT.replace(':wordKey', word), {
          replace: true,
        });
      }
      showSavedFlash();
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Save then jump to a fresh /new with packId preserved — for batch entry.
  const handleSaveAndAddAnother = async () => {
    setSaving(true);
    try {
      const word = await saveFormCore();
      if (!word) return;
      const packId = form.packId;
      navigate(`${ROUTES.MODEL_NEW}?packId=${encodeURIComponent(packId)}`, {
        replace: false,
      });
      // Reset the in-memory form so the next render starts clean even before
      // useEffect re-syncs against the (new) URL.
      setForm({ ...EMPTY_MODEL, packId });
      setSyllableInput('');
      setScaleInput(String(EMPTY_MODEL.scale));
      setPositionYInput(String(EMPTY_MODEL.positionY));
      setPositionZInput(String(EMPTY_MODEL.positionZ ?? -1.0));
      showSavedFlash();
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!wordKey || isNew) {
      return;
    }
    if (!window.confirm(`Delete model "${wordKey}"? This cannot be undone.`)) {
      return;
    }
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
            <Button
              variant="ghost"
              icon={<ArrowLeft size={16} />}
              onClick={() => navigate(ROUTES.MODELS)}
            >
              Back
            </Button>
            {!isNew && (
              <Button
                variant="danger"
                icon={<Trash2 size={16} />}
                loading={deleting}
                onClick={handleDelete}
              >
                Delete
              </Button>
            )}
            <Button
              variant="ghost"
              icon={<Plus size={16} />}
              loading={saving}
              onClick={handleSaveAndAddAnother}
            >
              Save &amp; Add Another
            </Button>
            <Button
              icon={<Save size={16} />}
              loading={saving}
              onClick={handleSave}
            >
              Save Model
            </Button>
          </div>
        }
      />

      {savedFlash && (
        <p className="model-editor__saved-flash" role="status">
          <CheckCircle2 size={16} /> Saved
        </p>
      )}
      {error && <p className="model-editor__error">{error}</p>}

      <div className="model-editor__body">
        {/* Left — word details */}
        <div className="model-editor__card">
          <h2 className="model-editor__section-title">Word Details</h2>

          <FormField
            label="Word"
            hint="Lowercase, single word. e.g. triceratops"
            required
          >
            <input
              className="form-input"
              value={form.word}
              onChange={(e) => set('word', e.target.value.toLowerCase().trim())}
              placeholder="triceratops"
              disabled={!isNew}
            />
          </FormField>

          <FormField
            label="Syllables"
            hint="Comma-separated. e.g. tri, cer, a, tops"
          >
            <input
              className="form-input"
              value={syllableInput}
              onChange={(e) => setSyllableInput(e.target.value)}
              placeholder="tri, cer, a, tops"
            />
          </FormField>

          <FormField
            label="Sinhala Label"
            hint="Optional — Sinhala script translation shown alongside the English word (e.g. ඇපල්). Verify with a native speaker."
          >
            <input
              className="form-input"
              value={form.sinhalaLabel ?? ''}
              onChange={(e) => set('sinhalaLabel', e.target.value)}
              placeholder="ඇපල්"
            />
          </FormField>

          <FormField label="Pack" required>
            <select
              className="form-select"
              value={form.packId}
              onChange={(e) => set('packId', e.target.value)}
            >
              <option value="">Select a pack…</option>
              {packs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </FormField>

          <div className="model-editor__ar-row">
            <FormField label="AR Scale" hint="Start at 0.004 for small objects">
              <input
                type="number"
                className="form-input"
                value={scaleInput}
                step={0.001}
                min={0.0001}
                onChange={onScaleChange}
                onBlur={onScaleBlur}
              />
            </FormField>
            <FormField label="Position Y" hint="Vertical offset in AR">
              <input
                type="number"
                className="form-input"
                value={positionYInput}
                step={0.01}
                onChange={onPositionYChange}
                onBlur={onPositionYBlur}
              />
            </FormField>
            <FormField
              label="Position Z"
              hint="Distance from camera. Negative = in front (e.g. -1.0)."
            >
              <input
                type="number"
                className="form-input"
                value={positionZInput}
                step={0.05}
                onChange={onPositionZChange}
                onBlur={onPositionZBlur}
              />
            </FormField>
          </div>

          <FormField
            label="Calibrated on device"
            hint="Flip on once you've confirmed the model looks right in AR."
          >
            <Toggle
              checked={form.isCalibrated}
              onChange={(v) => set('isCalibrated', v)}
              label={form.isCalibrated ? 'Calibrated' : 'Not calibrated'}
            />
          </FormField>
        </div>

        {/* Right — file uploads */}
        <div className="model-editor__card">
          <h2 className="model-editor__section-title">3D Model (GLB)</h2>
          <p className="model-editor__section-subtitle">
            Max 2 MB. Must be a GLB file.
          </p>
          <FileUploader
            accept=".glb"
            label=".glb file, max 2 MB"
            currentUrl={form.modelUrl}
            onUpload={handleGlbUpload}
          />
          {glbProgress !== null && glbProgress < 100 && (
            <p className="model-editor__progress">
              Uploading GLB… {glbProgress}%
            </p>
          )}
          {form.modelUrl && (
            <a
              href={form.modelUrl}
              target="_blank"
              rel="noreferrer"
              className="model-editor__file-link"
            >
              View current GLB
            </a>
          )}

          <h2 className="model-editor__section-title" style={{ marginTop: 8 }}>
            Audio (MP3)
          </h2>
          <p className="model-editor__section-subtitle">
            Single spoken word, natural pace, no music.
          </p>
          <FileUploader
            accept=".mp3,audio/*"
            label=".mp3 file, mono 44.1kHz"
            currentUrl={form.audioUrl}
            onUpload={handleAudioUpload}
          />
          {audioProgress !== null && audioProgress < 100 && (
            <p className="model-editor__progress">
              Uploading audio… {audioProgress}%
            </p>
          )}
          {form.audioUrl && (
            <audio
              controls
              src={form.audioUrl}
              className="model-editor__audio-preview"
            />
          )}
        </div>
      </div>
    </div>
  );
};
