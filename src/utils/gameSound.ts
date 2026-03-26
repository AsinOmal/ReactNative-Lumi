/**
 * gameSound.ts
 *
 * Manages SFX for the AR Word Find game using react-native-sound.
 * Uses require() so Metro bundles the assets — no Xcode rebuild needed.
 */

import Sound from 'react-native-sound';

Sound.setCategory('Playback'); // play even when silent switch is on

type SFX = 'correct' | 'wrong' | 'tick' | 'victory' | 'gameover';

const pool: Partial<Record<SFX, Sound>> = {};

const SOURCES: Record<SFX, any> = {
  correct:  require('../assets/audio/sfx/correct-answer.mp3'),
  wrong:    require('../assets/audio/sfx/wrong buszz.mp3'),
  tick:     require('../assets/audio/sfx/countdown-tick.mp3'),
  victory:  require('../assets/audio/sfx/victory.mp3'),
  gameover: require('../assets/audio/sfx/game-over.mp3'),
};

/** Preload all SFX. Call once on screen mount. */
export function loadGameSounds() {
  (Object.keys(SOURCES) as SFX[]).forEach(key => {
    try {
      const s = new Sound(SOURCES[key], (err: any) => {
        if (!err) pool[key] = s;
        else console.warn(`[gameSound] failed to load "${key}":`, err);
      });
    } catch (e) {
      console.warn(`[gameSound] require error for "${key}":`, e);
    }
  });
}

/** Play a sound, restarting from the beginning if already playing. */
export function playSound(key: SFX) {
  const s = pool[key];
  if (!s) return;
  s.stop(() => {
    s.setCurrentTime(0);
    s.play((ok: boolean) => {
      if (!ok) s.reset(); // recover from audio session interruption
    });
  });
}

/** Release all sounds. Call on screen unmount. */
export function releaseGameSounds() {
  (Object.keys(pool) as SFX[]).forEach(key => {
    pool[key]?.release();
    delete pool[key];
  });
}
