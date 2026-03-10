/**
 * Model Registry — maps each word to its local .glb asset, syllable
 * breakdown, and pronunciation audio file.
 *
 * Scale calculation methodology:
 *   actual_render_size = geometry_bbox * internal_matrix_scale
 *   viro_scale = target_size_meters / geometry_bbox (Viro applies scale on top of GLB transforms)
 *
 * Per-model diagnosis from GLB bounding box + node transform analysis:
 *   apple:      bbox 82 units,  matrix_scale 1.0  → scale 0.0037
 *   banana:     bbox  4.6 units, matrix_scale 100  → renders 460m! scale 0.00065
 *   cherry:     bbox  5.9 units, matrix_scale 1.0  → scale 0.050 ✓
 *   grape:      bbox 25.8 units, matrix_scale 1.0  → scale 0.012
 *   lemon:      bbox  7.7 units, matrix_scale 1.0  → scale 0.038 ✓
 *   mango:      bbox  2.0 units, matrix_scale 1.0  → textures dark, bring close
 *   orange:     bbox  2.0 units, matrix_scale 1.0  → textures dark, bring close
 *   pineapple:  bbox  4.5 units, matrix_scale 0.033 → renders 0.15m, scale 2.0
 *   strawberry: bbox  5.85 units, matrix_scale 0.084 → renders 0.49m, scale 0.6
 *   watermelon: bbox  5.78 units, matrix_scale 1.0  → scale 0.052 ✓
 */

export type ModelKey = string;

export interface ModelEntry {
  source: number;
  scale: [number, number, number];
  position: [number, number, number]; // AR world position [x, y, z]
  syllables: string[];                // e.g. ['Ap', 'ple']
  audio: string;                      // filename in iOS main bundle, e.g. 'apple.mp3'
}

export const MODEL_REGISTRY: Record<ModelKey, ModelEntry> = {
  // ── Fruits Pack ───────────────────────────────────────────────────────────
  //                                                         scale                            position   syllables                          audio
  apple:      { source: require('../assets/models/fruits/apple.glb'),      scale: [0.0037, 0.0037, 0.0037],   position: [0, 0.0, -1.0],  syllables: ['Ap', 'ple'],              audio: 'apple.mp3' },
  banana:     { source: require('../assets/models/fruits/banana.glb'),     scale: [0.00065, 0.00065, 0.00065], position: [0, 0.0, -1.0], syllables: ['Ba', 'na', 'na'],         audio: 'banana.mp3' },
  cherry:     { source: require('../assets/models/fruits/cherry.glb'),     scale: [0.050, 0.050, 0.050],      position: [0, 0.0, -1.0],  syllables: ['Cher', 'ry'],             audio: 'cherry.mp3' },
  grape:      { source: require('../assets/models/fruits/grape.glb'),      scale: [0.012, 0.012, 0.012],      position: [0, 0.0, -1.0],  syllables: ['Grape'],                  audio: 'grape.mp3' },
  lemon:      { source: require('../assets/models/fruits/lemon.glb'),      scale: [0.038, 0.038, 0.038],      position: [0, 0.0, -1.0],  syllables: ['Lem', 'on'],              audio: 'lemon.mp3' },
  mango:      { source: require('../assets/models/fruits/mango.glb'),      scale: [0.20,  0.20,  0.20 ],      position: [0, 0.0, -0.35], syllables: ['Man', 'go'],              audio: 'mango.mp3' },
  orange:     { source: require('../assets/models/fruits/orange.glb'),     scale: [0.20,  0.20,  0.20 ],      position: [0, 0.0, -0.35], syllables: ['Or', 'ange'],             audio: 'orange.mp3' },
  pineapple:  { source: require('../assets/models/fruits/pineapple.glb'),  scale: [3.5,   3.5,   3.5  ],      position: [0, 0.0, -0.8],  syllables: ['Pine', 'ap', 'ple'],      audio: 'pineapple.mp3' },
  strawberry: { source: require('../assets/models/fruits/strawberry.glb'), scale: [0.60,  0.60,  0.60 ],      position: [0, 0.0, -1.0],  syllables: ['Straw', 'ber', 'ry'],     audio: 'strawberry.mp3' },
  watermelon: { source: require('../assets/models/fruits/watermelon.glb'), scale: [0.052, 0.052, 0.052],      position: [0, 0.0, -1.0],  syllables: ['Wa', 'ter', 'mel', 'on'], audio: 'watermelon.mp3' },
};

/** Returns the model entry for a given word, or null if not found. */
export const getModel = (word: string): ModelEntry | null => {
  return MODEL_REGISTRY[word.toLowerCase()] ?? null;
};
