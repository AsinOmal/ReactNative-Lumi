import React, { useState, useEffect } from 'react';
import { Megaphone } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Toggle } from '../../components/common/Toggle';
import { ColorPicker } from '../../components/common/ColorPicker';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useBanner } from '../../hooks/useBanner';
import type { BannerConfig } from '../../types';
import './BannerSection.css';

const EMPTY: BannerConfig = {
  message: '',
  accentColor: '#7B3FC4',
  expiresAt: new Date(Date.now() + 7 * 86_400_000),
  isActive: false,
};

const toLocal = (d: Date) => {
  const offset = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 16);
};

export const BannerSection: React.FC = () => {
  const { banner, loading, saving, saveBanner } = useBanner();
  const [form, setForm] = useState<BannerConfig>(EMPTY);
  const [error, setError] = useState('');

  useEffect(() => { setForm(banner ?? EMPTY); }, [banner]);

  const handleSave = async () => {
    if (!form.message.trim()) { setError('Message is required.'); return; }
    setError('');
    try { await saveBanner(form); }
    catch { setError('Failed to save. Try again.'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="banner-section">
      <div className="banner-section__header">
        <Megaphone size={16} className="banner-section__icon" />
        <div>
          <p className="banner-section__title">In-App Banner</p>
          <p className="banner-section__sub">
            Shown at the top of the Home screen until the expiry time.
            Stored in <code>/adminConfig/banner</code>.
          </p>
        </div>
      </div>

      <div className="banner-section__form">
        <label className="banner-section__label">Message</label>
        <textarea
          className="banner-section__textarea"
          rows={2}
          maxLength={200}
          placeholder="e.g. New Vegetables Pack is live — tap Library to explore."
          value={form.message}
          onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
        />

        <label className="banner-section__label">Accent Colour</label>
        <ColorPicker value={form.accentColor} onChange={c => setForm(p => ({ ...p, accentColor: c }))} />

        <label className="banner-section__label">Expires At</label>
        <input
          type="datetime-local"
          className="banner-section__date"
          value={toLocal(form.expiresAt)}
          onChange={e => setForm(p => ({ ...p, expiresAt: new Date(e.target.value) }))}
        />

        <div className="banner-section__active-row">
          <div>
            <p className="banner-section__label" style={{ marginBottom: 2 }}>Active</p>
            <p className="banner-section__hint">Inactive banners are never shown even before expiry.</p>
          </div>
          <Toggle checked={form.isActive} onChange={v => setForm(p => ({ ...p, isActive: v }))} disabled={saving} />
        </div>

        {error && <p className="banner-section__error">{error}</p>}

        <div className="banner-section__actions">
          {form.isActive && <span className="banner-section__live">Live</span>}
          <Button loading={saving} onClick={handleSave}>Save Banner</Button>
        </div>
      </div>
    </div>
  );
};
