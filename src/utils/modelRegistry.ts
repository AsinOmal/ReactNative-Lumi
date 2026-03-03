/**
 * Model Registry — maps each word to its local .glb asset.
 * ViroReact requires static require() calls for bundled assets.
 *
 * Scales derived from GLB bounding box analysis (targeting ~0.3m display size):
 *   apple:      82 units  → scale ~0.0037
 *   banana:      4.6 units → scale ~0.065
 *   cherry:      5.9 units → scale ~0.050
 *   grape:      25.8 units → scale ~0.012
 *   lemon:       7.7 units → scale ~0.038
 *   mango:       2.0 units → scale ~0.150
 *   orange:      2.0 units → scale ~0.150
 *   pineapple:   4.5 units → scale ~0.067
 *   strawberry:  5.8 units → scale ~0.051
 *   watermelon:  5.8 units → scale ~0.052
 *
 * position: [x, y, z] — y controls vertical (negative = lower), z controls distance (negative = further)
 */

export type ModelKey = string;

export interface ModelEntry {
  source: number;
  scale: [number, number, number];
  position: [number, number, number]; // AR world position
}

export const MODEL_REGISTRY: Record<ModelKey, ModelEntry> = {
  // ── Fruits Pack ─────────────────────────────────────────────────────────
  //                                                         scale               position [x, y,    z   ]
  apple:      { source: require('../assets/models/fruits/apple.glb'),      scale: [0.0037, 0.0037, 0.0037], position: [0, -0.1, -1.2] },
  banana:     { source: require('../assets/models/fruits/banana.glb'),     scale: [0.055,  0.055,  0.055 ], position: [0,  0.0, -1.3] },
  cherry:     { source: require('../assets/models/fruits/cherry.glb'),     scale: [0.050,  0.050,  0.050 ], position: [0,  0.0, -1.2] },
  grape:      { source: require('../assets/models/fruits/grape.glb'),      scale: [0.012,  0.012,  0.012 ], position: [0,  0.0, -1.0] },
  lemon:      { source: require('../assets/models/fruits/lemon.glb'),      scale: [0.038,  0.038,  0.038 ], position: [0,  0.0, -1.2] },
  mango:      { source: require('../assets/models/fruits/mango.glb'),      scale: [0.150,  0.150,  0.150 ], position: [0,  0.0, -1.2] },
  orange:     { source: require('../assets/models/fruits/orange.glb'),     scale: [0.150,  0.150,  0.150 ], position: [0,  0.0, -1.2] },
  pineapple:  { source: require('../assets/models/fruits/pineapple.glb'),  scale: [0.067,  0.067,  0.067 ], position: [0,  0.0, -1.2] },
  strawberry: { source: require('../assets/models/fruits/strawberry.glb'), scale: [0.051,  0.051,  0.051 ], position: [0,  0.0, -1.1] },
  watermelon: { source: require('../assets/models/fruits/watermelon.glb'), scale: [0.052,  0.052,  0.052 ], position: [0,  0.0, -1.2] },
};

/** Returns the model entry for a given word, or null if not found. */
export const getModel = (word: string): ModelEntry | null => {
  return MODEL_REGISTRY[word.toLowerCase()] ?? null;
};
