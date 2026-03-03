/**
 * Model Registry — maps each word to its local .glb asset.
 * ViroReact requires static require() calls for bundled assets.
 *
 * To add a new pack, add a new key block below.
 */

export type ModelKey = string; // word in lowercase

interface ModelEntry {
  source: number; // result of require()
  scale: [number, number, number]; // tuned per-model so it looks right in AR
}

export const MODEL_REGISTRY: Record<ModelKey, ModelEntry> = {
  // ── Fruits Pack ─────────────────────────────────────────────────────
  apple:      { source: require('../assets/models/fruits/apple.glb'),      scale: [0.06, 0.06, 0.06] },
  banana:     { source: require('../assets/models/fruits/banana.glb'),     scale: [0.03, 0.03, 0.03] },
  cherry:     { source: require('../assets/models/fruits/cherry.glb'),     scale: [0.05, 0.05, 0.05] },
  grape:      { source: require('../assets/models/fruits/grape.glb'),      scale: [0.04, 0.04, 0.04] },
  lemon:      { source: require('../assets/models/fruits/lemon.glb'),      scale: [0.06, 0.06, 0.06] },
  mango:      { source: require('../assets/models/fruits/mango.glb'),      scale: [0.06, 0.06, 0.06] },
  orange:     { source: require('../assets/models/fruits/orange.glb'),     scale: [0.04, 0.04, 0.04] },
  pineapple:  { source: require('../assets/models/fruits/pineapple.glb'),  scale: [0.06, 0.06, 0.06] },
  strawberry: { source: require('../assets/models/fruits/strawberry.glb'), scale: [0.06, 0.06, 0.06] },
  watermelon: { source: require('../assets/models/fruits/watermelon.glb'), scale: [0.04, 0.04, 0.04] },
};

/** Returns the model entry for a given word, or null if not found. */
export const getModel = (word: string): ModelEntry | null => {
  return MODEL_REGISTRY[word.toLowerCase()] ?? null;
};
