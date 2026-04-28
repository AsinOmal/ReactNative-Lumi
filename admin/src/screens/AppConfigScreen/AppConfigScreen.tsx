import React from 'react';
import { Settings } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Toggle } from '../../components/common/Toggle';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAppConfig } from '../../hooks/useAppConfig';
import './AppConfigScreen.css';

interface FlagRow {
  key: keyof import('../../types').AppConfig;
  label: string;
  description: string;
  danger?: boolean;
}

const FLAGS: FlagRow[] = [
  {
    key: 'maintenanceMode',
    label: 'Maintenance Mode',
    description: 'Show a maintenance banner in the mobile app. AR features remain accessible.',
    danger: true,
  },
  {
    key: 'newUserOnboarding',
    label: 'New User Onboarding',
    description: 'Show the 3-slide onboarding flow to first-time users.',
  },
  {
    key: 'premiumPacksEnabled',
    label: 'Premium Packs Enabled',
    description: 'Allow users to see and purchase premium content packs (Dinosaurs, Space).',
  },
  {
    key: 'arGamesEnabled',
    label: 'AR Games Enabled',
    description: 'Enable Make a Meal and Scan & Count games from the home screen.',
  },
];

export const AppConfigScreen: React.FC = () => {
  const { config, loading, saving, updateConfig } = useAppConfig();

  if (loading) return <LoadingSpinner />;

  return (
    <div className="app-config">
      <PageHeader
        title="App Config"
        subtitle="Feature flags — changes take effect on the next app foreground"
      />

      <div className="app-config__card">
        <div className="app-config__header">
          <Settings size={16} className="app-config__icon" />
          <div>
            <p className="app-config__card-title">Feature Flags</p>
            <p className="app-config__card-sub">
              Stored in <code>/adminConfig/featureFlags</code>. The mobile app reads these on launch.
            </p>
          </div>
        </div>

        <div className="app-config__rows">
          {FLAGS.map(flag => (
            <div key={flag.key} className={`app-config__row ${flag.danger && config[flag.key] ? 'app-config__row--danger' : ''}`}>
              <div className="app-config__row-info">
                <p className="app-config__row-label">{flag.label}</p>
                <p className="app-config__row-desc">{flag.description}</p>
              </div>
              <Toggle
                checked={config[flag.key] as boolean}
                onChange={(val) => updateConfig({ [flag.key]: val })}
                disabled={saving}
              />
            </div>
          ))}
        </div>

        {saving && <p className="app-config__saving">Saving…</p>}
      </div>
    </div>
  );
};
