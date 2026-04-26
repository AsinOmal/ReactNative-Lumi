/**
 * uiSound.ts
 *
 * Lightweight UI sound effects for navigation and interaction feedback.
 * Uses react-native-sound (already installed for game sounds).
 *
 * Audio files go in src/assets/audio/ui/ — add your files there and
 * uncomment the require() calls below. Sounds are loaded lazily on first
 * play so they don't block startup.
 *
 * Why separate from gameSound.ts:
 *   gameSound.ts is scoped to the AR Word Find game lifecycle (load on
 *   mount, release on unmount). UI sounds persist for the whole session.
 */

import Sound from 'react-native-sound';

Sound.setCategory('Ambient'); // UI sounds respect the silent switch

type UISfx = 'tap' | 'tab' | 'found' | 'saved' | 'pack_open';

// ── Placeholder sources ───────────────────────────────────────────────────────
// Add your audio files to src/assets/audio/ui/ then replace null with:
//   require('../assets/audio/ui/<filename>.mp3')
const SOURCES: Partial<Record<UISfx, any>> = {
  tap:       null, // short soft pop — button / card press
  tab:       null, // subtle click — tab bar switch
  found:     null, // pleasant chime — word recognised in scanner
  saved:     null, // warm ding — word bookmarked
  pack_open: null, // swoosh or sparkle — pack card tapped
};
// ─────────────────────────────────────────────────────────────────────────────

const pool: Partial<Record<UISfx, Sound>> = {};

function load(key: UISfx) {
  const src = SOURCES[key];
  if (!src || pool[key]) return;
  try {
    const s = new Sound(src, (err: any) => {
      if (!err) pool[key] = s;
      else console.warn(`[uiSound] failed to load "${key}":`, err);
    });
  } catch (e) {
    console.warn(`[uiSound] require error for "${key}":`, e);
  }
}

export function playUI(key: UISfx) {
  if (!SOURCES[key]) return; // placeholder not yet filled — silent skip
  load(key);
  const s = pool[key];
  if (!s) return;
  s.stop(() => {
    s.setCurrentTime(0);
    s.play((ok: boolean) => { if (!ok) s.reset(); });
  });
}
