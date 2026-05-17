/**
 * ambientSound.ts
 *
 * Singleton manager for the looping ambient background music played across
 * all MainTabs screens (Home / Library / Playground / Settings). Lives outside
 * any React tree so navigating between tabs doesn't tear it down and restart it.
 *
 * Why an AppState listener inside the module (not in a screen):
 *   The music must pause when the user backgrounds the app — otherwise it keeps
 *   playing in their pocket (battery + privacy). Owning that subscription here
 *   means callers don't have to remember to wire it up at every entry point.
 *
 * Why category 'Playback':
 *   'Ambient' respects the iOS silent switch — flipping the ringer to silent
 *   makes the music inaudible, which is not what a kid playing a learning
 *   app expects. 'Playback' ignores the silent switch and plays through.
 *   Second arg = mixWithOthers so the OS doesn't tear other audio sessions.
 */

import Sound from 'react-native-sound';
import { AppState, AppStateStatus } from 'react-native';
import { config } from '../constants/config';

Sound.setCategory('Playback', true);

let sound: Sound | null = null;
let isMuted = false;
let isActive = false; // caller has asked us to be playing (vs. naturally stopped)
let appStateSub: { remove: () => void } | null = null;

const ensureLoaded = (): Promise<Sound | null> => {
  if (sound) {
    return Promise.resolve(sound);
  }
  return new Promise((resolve) => {
    const s = new Sound(
      require('../assets/audio/sfx/ambient-1.mp3'),
      (err: unknown) => {
        if (err) {
          console.warn('[ambientSound] load failed:', err);
          resolve(null);
          return;
        }
        s.setNumberOfLoops(-1);
        s.setVolume(config.AMBIENT_VOLUME);
        sound = s;
        if (__DEV__) {
          console.log(
            `[ambientSound] loaded: duration=${s.getDuration().toFixed(1)}s, volume=${config.AMBIENT_VOLUME}`
          );
        }
        resolve(s);
      }
    );
  });
};

const handleAppStateChange = (next: AppStateStatus) => {
  if (!isActive || isMuted || !sound) {
    return;
  }
  if (next === 'active') {
    sound.play();
  } else {
    sound.pause();
  }
};

export const startAmbient = async (): Promise<void> => {
  isActive = true;
  if (__DEV__) {
    console.log(`[ambientSound] startAmbient called, isMuted=${isMuted}`);
  }
  // Load and play even when muted — muting just zeroes the volume. If we
  // early-returned on mute, a cold start with a persisted mute=true would
  // never load the file, and tapping unmute later would find sound===null
  // and silently fail.
  const s = await ensureLoaded();
  if (!s || !isActive) {
    return;
  }
  s.setVolume(isMuted ? 0 : config.AMBIENT_VOLUME);
  s.play((ok: boolean) => {
    if (__DEV__ && !ok) {
      console.warn('[ambientSound] playback callback reported failure');
    }
  });
  if (!appStateSub) {
    appStateSub = AppState.addEventListener('change', handleAppStateChange);
  }
};

export const stopAmbient = (): void => {
  isActive = false;
  sound?.pause();
  appStateSub?.remove();
  appStateSub = null;
};

// Volume-based mute (not pause/play) — react-native-sound's resume after
// pause on a looping track is unreliable on iOS, and a paused track may
// fail to restart entirely. Zeroing the volume keeps the audio session
// alive so unmuting is instant and never gets stuck.
export const setAmbientMuted = (muted: boolean): void => {
  isMuted = muted;
  if (__DEV__) {
    console.log(
      `[ambientSound] setAmbientMuted(${muted}) sound=${!!sound} isActive=${isActive}`
    );
  }
  if (!sound) {
    return;
  }
  sound.setVolume(muted ? 0 : config.AMBIENT_VOLUME);
};

export const getAmbientMuted = (): boolean => isMuted;
