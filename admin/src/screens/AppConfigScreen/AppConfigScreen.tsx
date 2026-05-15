import React from 'react';
import { Settings, Sliders } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Toggle } from '../../components/common/Toggle';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAppConfig } from '../../hooks/useAppConfig';
import { useGameConstants, DEFAULT_CONSTANTS } from '../../hooks/useGameConstants';
import { PinManagementSection } from './PinManagementSection';
import type { AppConfig, GameConstants } from '../../types';
import './AppConfigScreen.css';

interface FlagRow { key: keyof AppConfig; label: string; description: string; danger?: boolean; }
interface ConstRow { key: keyof Omit<GameConstants, 'dailyWordList'>; label: string; description: string; min: number; }

const FLAGS: FlagRow[] = [
  { key: 'maintenanceMode',    label: 'Maintenance Mode',      description: 'Show a maintenance banner in the mobile app. AR features remain accessible.', danger: true },
  { key: 'newUserOnboarding',  label: 'New User Onboarding',   description: 'Show the 3-slide onboarding flow to first-time users.' },
  { key: 'premiumPacksEnabled',label: 'Premium Packs Enabled', description: 'Allow users to see and purchase premium content packs (Dinosaurs, Space).' },
  { key: 'arGamesEnabled',     label: 'AR Games Enabled',      description: 'Enable Make a Meal and Scan & Count games from the home screen.' },
];

const CONST_ROWS: ConstRow[] = [
  { key: 'scanIntervalMs',         label: 'Scan Interval (ms)',         description: 'OCR capture frequency. Default: 1000.',                     min: 200  },
  { key: 'hazardCheckIntervalMs',  label: 'Hazard Check Interval (ms)', description: 'Safety classification frequency. Default: 5000.',           min: 1000 },
  { key: 'hazardCooldownMs',       label: 'Hazard Cooldown (ms)',       description: 'Re-alert suppression window after dismiss. Default: 30000.', min: 0    },
  { key: 'arGameDurationSec',      label: 'AR Game Duration (sec)',      description: 'Word Find timer length. Default: 60.',                      min: 10   },
];

export const AppConfigScreen: React.FC = () => {
  const { config, loading, saving, updateConfig } = useAppConfig();
  const { constants, loading: constLoading, saving: constSaving, updateConstants } = useGameConstants();

  if (loading || constLoading) return <LoadingSpinner />;

  return (
    <div className="app-config">
      <PageHeader title="App Config" subtitle="Feature flags and game constants — changes take effect on next app launch" />

      <div className="app-config__card">
        <div className="app-config__header">
          <Settings size={16} className="app-config__icon" />
          <div>
            <p className="app-config__card-title">Feature Flags</p>
            <p className="app-config__card-sub">Stored in <code>/adminConfig/featureFlags</code>. Mobile reads on launch.</p>
          </div>
        </div>
        <div className="app-config__rows">
          {FLAGS.map(flag => (
            <div key={flag.key} className={`app-config__row ${flag.danger && config[flag.key] ? 'app-config__row--danger' : ''}`}>
              <div className="app-config__row-info">
                <p className="app-config__row-label">{flag.label}</p>
                <p className="app-config__row-desc">{flag.description}</p>
              </div>
              <Toggle checked={config[flag.key] as boolean} onChange={(val) => updateConfig({ [flag.key]: val })} disabled={saving} />
            </div>
          ))}
        </div>
        {saving && <p className="app-config__saving">Saving…</p>}
      </div>

      <div className="app-config__card">
        <div className="app-config__header">
          <Sliders size={16} className="app-config__icon" />
          <div>
            <p className="app-config__card-title">Game Constants</p>
            <p className="app-config__card-sub">Stored in <code>/adminConfig/gameConstants</code>. Mobile reads on launch.</p>
          </div>
        </div>
        <div className="app-config__rows">
          {CONST_ROWS.map(row => (
            <div key={row.key} className="app-config__row">
              <div className="app-config__row-info">
                <p className="app-config__row-label">{row.label}</p>
                <p className="app-config__row-desc">{row.description}</p>
              </div>
              <input
                type="number"
                className="app-config__number"
                defaultValue={constants[row.key] as number}
                min={row.min}
                onBlur={e => updateConstants({ [row.key]: Number(e.target.value) || DEFAULT_CONSTANTS[row.key] })}
              />
            </div>
          ))}
          <div className="app-config__row app-config__row--stacked">
            <div className="app-config__row-info">
              <p className="app-config__row-label">Daily Word List</p>
              <p className="app-config__row-desc">Comma-separated words that override the date-seeded word of the day rotation.</p>
            </div>
            <textarea
              className="app-config__word-list"
              rows={3}
              defaultValue={constants.dailyWordList.join(', ')}
              placeholder="apple, banana, carrot…"
              onBlur={e => {
                const words = e.target.value.split(',').map(w => w.trim()).filter(Boolean);
                updateConstants({ dailyWordList: words });
              }}
            />
          </div>
        </div>
        {constSaving && <p className="app-config__saving">Saving…</p>}
      </div>

      <PinManagementSection />
    </div>
  );
};
