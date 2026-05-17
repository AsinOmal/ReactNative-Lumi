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

// 'Playback' (not 'Ambient') so taps play even when the iOS silent switch is
// on. react-native-sound's setCategory is global, so this must match what
// ambientSound.ts and gameSound.ts use or the last-loaded module wins and
// the category can silently flip mid-session.
Sound.setCategory('Playback', true);

type UISfx = 'tap' | 'tab' | 'found' | 'saved' | 'pack_open';

// ── Sources ───────────────────────────────────────────────────────────────────
// `tap` and `tab` are loaded eagerly on first play. Game-mode SFX (found, saved,
// pack_open) stay null here — those remain owned by gameSound.ts to keep the
// game soundscape under one lifecycle.
const SOURCES: Partial<Record<UISfx, any>> = {
  tap: require('../assets/audio/sfx/pop-tap.mp3'), // every UI tap (cards, buttons)
  tab: require('../assets/audio/sfx/tab-bar-tap.mp3'), // tab bar icon switch
  found: null,
  saved: null,
  pack_open: null,
};
// ─────────────────────────────────────────────────────────────────────────────

const pool: Partial<Record<UISfx, Sound>> = {};

function load(key: UISfx) {
  const src = SOURCES[key];
  if (!src || pool[key]) {
    return;
  }
  try {
    const s = new Sound(src, (err: any) => {
      if (!err) {
        pool[key] = s;
      } else {
        console.warn(`[uiSound] failed to load "${key}":`, err);
      }
    });
  } catch (e) {
    console.warn(`[uiSound] require error for "${key}":`, e);
  }
}

export function playUI(key: UISfx) {
  if (!SOURCES[key]) {
    return;
  } // placeholder not yet filled — silent skip
  load(key);
  const s = pool[key];
  if (!s) {
    return;
  }
  s.stop(() => {
    s.setCurrentTime(0);
    s.play((ok: boolean) => {
      if (!ok) {
        s.reset();
      }
    });
  });
}
