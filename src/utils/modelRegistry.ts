/**
 * Model Registry — maps each word to its local .glb asset, syllable
 * breakdown, and pronunciation audio file.
 *
 * Scale calculation methodology:
 *   actual_render_size = geometry_bbox * internal_matrix_scale
 *   viro_scale = target_size_meters / geometry_bbox (Viro applies scale on top of GLB transforms)
 *
 * Fruits — hand-calibrated on device (scale values are final):
 *   apple: bbox 82u / apple:0.0037  banana: 0.00065  cherry: 0.050  grape: 0.012
 *   lemon: 0.038  pineapple: 3.5  strawberry: 0.60  watermelon: 0.052
 *
 * ⚠️ Vegetables & Vehicles scales are PLACEHOLDER (0.5 default).
 *   Test each on device and update — wrong scale = model too large/small in AR.
 *   Audio files (.mp3) for vegetables and vehicles also need to be added to the iOS bundle.
 */

export type ModelKey = string;

export interface ModelEntry {
  source: number;
  scale: [number, number, number];
  position: [number, number, number];
  syllables: string[];
  audio: string;
  emoji: string;
}

export const MODEL_REGISTRY: Record<ModelKey, ModelEntry> = {
  // ── Fruits Pack ───────────────────────────────────────────────────────────
  apple:      { source: require('../assets/models/fruits/apple.glb'),      scale: [0.0037, 0.0037, 0.0037], position: [0, 0, -1.0], syllables: ['Ap', 'ple'],              audio: 'apple.mp3',      emoji: '🍎' },
  banana:     { source: require('../assets/models/fruits/banana.glb'),     scale: [0.00065, 0.00065, 0.00065], position: [0, 0, -1.0], syllables: ['Ba', 'na', 'na'],      audio: 'banana.mp3',     emoji: '🍌' },
  cherry:     { source: require('../assets/models/fruits/cherry.glb'),     scale: [0.050, 0.050, 0.050], position: [0, 0, -1.0], syllables: ['Cher', 'ry'],               audio: 'cherry.mp3',     emoji: '🍒' },
  grape:      { source: require('../assets/models/fruits/grape.glb'),      scale: [0.012, 0.012, 0.012], position: [0, 0, -1.0], syllables: ['Grape'],                    audio: 'grape.mp3',      emoji: '🍇' },
  lemon:      { source: require('../assets/models/fruits/lemon.glb'),      scale: [0.038, 0.038, 0.038], position: [0, 0, -1.0], syllables: ['Lem', 'on'],                audio: 'lemon.mp3',      emoji: '🍋' },
  mango:      { source: require('../assets/models/fruits/mango.glb'),      scale: [0.60,  0.60,  0.60],  position: [0, 0, -0.35], syllables: ['Man', 'go'],               audio: 'mango.mp3',      emoji: '🥭' },
  orange:     { source: require('../assets/models/fruits/orange.glb'),     scale: [0.60,  0.60,  0.60],  position: [0, 0, -0.35], syllables: ['Or', 'ange'],              audio: 'orange.mp3',     emoji: '🍊' },
  pineapple:  { source: require('../assets/models/fruits/pineapple.glb'),  scale: [3.5,   3.5,   3.5],   position: [0, 0, -0.8],  syllables: ['Pine', 'ap', 'ple'],       audio: 'pineapple.mp3',  emoji: '🍍' },
  strawberry: { source: require('../assets/models/fruits/strawberry.glb'), scale: [0.60,  0.60,  0.60],  position: [0, 0, -1.0],  syllables: ['Straw', 'ber', 'ry'],      audio: 'strawberry.mp3', emoji: '🍓' },
  watermelon: { source: require('../assets/models/fruits/watermelon.glb'), scale: [0.052, 0.052, 0.052], position: [0, 0, -1.0],  syllables: ['Wa', 'ter', 'mel', 'on'],  audio: 'watermelon.mp3', emoji: '🍉' },

  // ── Vegetables Pack ───────────────────────────────────────────────────────
  // 🚧 DISABLED — scales uncalibrated, re-enable after on-device testing
  // broccoli:   { source: require('../assets/models/vegetables/broccoli.glb'),     scale: [0.1, 0.1, 0.1], position: [0, 0, -1.0], syllables: ['Broc', 'co', 'li'],       audio: 'broccoli.mp3',   emoji: '🥦' },
  // carrot:     { source: require('../assets/models/vegetables/carrot.glb'),       scale: [0.1, 0.1, 0.1], position: [0, 0, -1.0], syllables: ['Car', 'rot'],             audio: 'carrot.mp3',     emoji: '🥕' },
  // chili:      { source: require('../assets/models/vegetables/chili_pepper.glb'), scale: [0.1, 0.1, 0.1], position: [0, 0, -1.0], syllables: ['Chi', 'li'],              audio: 'chili.mp3',      emoji: '🌶️' },
  // corn:       { source: require('../assets/models/vegetables/corn.glb'),         scale: [0.1, 0.1, 0.1], position: [0, 0, -1.0], syllables: ['Corn'],                   audio: 'corn.mp3',       emoji: '🌽' },
  // cucumber:   { source: require('../assets/models/vegetables/cucumber.glb'),     scale: [0.1, 0.1, 0.1], position: [0, 0, -1.0], syllables: ['Cu', 'cum', 'ber'],       audio: 'cucumber.mp3',   emoji: '🥒' },
  // eggplant:   { source: require('../assets/models/vegetables/eggplant.glb'),     scale: [0.1, 0.1, 0.1], position: [0, 0, -1.0], syllables: ['Egg', 'plant'],           audio: 'eggplant.mp3',   emoji: '🍆' },
  // onion:      { source: require('../assets/models/vegetables/onion.glb'),        scale: [0.1, 0.1, 0.1], position: [0, 0, -1.0], syllables: ['On', 'ion'],              audio: 'onion.mp3',      emoji: '🧅' },
  // potato:     { source: require('../assets/models/vegetables/potato.glb'),       scale: [0.1, 0.1, 0.1], position: [0, 0, -1.0], syllables: ['Po', 'ta', 'to'],         audio: 'potato.mp3',     emoji: '🥔' },
  // pumpkin:    { source: require('../assets/models/vegetables/pumpkin.glb'),      scale: [0.1, 0.1, 0.1], position: [0, 0, -1.0], syllables: ['Pump', 'kin'],            audio: 'pumpkin.mp3',    emoji: '🎃' },
  // tomato:     { source: require('../assets/models/vegetables/tomato.glb'),       scale: [0.1, 0.1, 0.1], position: [0, 0, -1.0], syllables: ['To', 'ma', 'to'],         audio: 'tomato.mp3',     emoji: '🍅' },

  // ── Vehicles Pack ─────────────────────────────────────────────────────────
  // 🚧 DISABLED — scales uncalibrated, re-enable after on-device testing
  // bicycle:    { source: require('../assets/models/vehicles/bicycle.glb'),    scale: [0.1, 0.1, 0.1], position: [0, 0, -1.0], syllables: ['Bi', 'cy', 'cle'],         audio: 'bicycle.mp3',    emoji: '🚲' },
  // boat:       { source: require('../assets/models/vehicles/boat.glb'),       scale: [0.1, 0.1, 0.1], position: [0, 0, -1.0], syllables: ['Boat'],                    audio: 'boat.mp3',       emoji: '🚤' },
  // bus:        { source: require('../assets/models/vehicles/bus.glb'),        scale: [0.1, 0.1, 0.1], position: [0, 0, -1.0], syllables: ['Bus'],                     audio: 'bus.mp3',        emoji: '🚌' },
  // car:        { source: require('../assets/models/vehicles/car.glb'),        scale: [0.1, 0.1, 0.1], position: [0, 0, -1.0], syllables: ['Car'],                     audio: 'car.mp3',        emoji: '🚗' },
  // helicopter: { source: require('../assets/models/vehicles/helicopter.glb'), scale: [0.1, 0.1, 0.1], position: [0, 0, -1.0], syllables: ['He', 'li', 'cop', 'ter'], audio: 'helicopter.mp3', emoji: '🚁' },
  // plane:      { source: require('../assets/models/vehicles/plane.glb'),      scale: [0.1, 0.1, 0.1], position: [0, 0, -1.0], syllables: ['Plane'],                   audio: 'plane.mp3',      emoji: '✈️' },
  // rocket:     { source: require('../assets/models/vehicles/rocket.glb'),     scale: [0.1, 0.1, 0.1], position: [0, 0, -1.0], syllables: ['Rock', 'et'],              audio: 'rocket.mp3',     emoji: '🚀' },
  // tractor:    { source: require('../assets/models/vehicles/tractor.glb'),    scale: [0.1, 0.1, 0.1], position: [0, 0, -1.0], syllables: ['Trac', 'tor'],             audio: 'tractor.mp3',    emoji: '🚜' },
  // train:      { source: require('../assets/models/vehicles/train.glb'),      scale: [0.1, 0.1, 0.1], position: [0, 0, -1.0], syllables: ['Train'],                   audio: 'train.mp3',      emoji: '🚂' },
  // truck:      { source: require('../assets/models/vehicles/truck.glb'),      scale: [0.1, 0.1, 0.1], position: [0, 0, -1.0], syllables: ['Truck'],                   audio: 'truck.mp3',      emoji: '🚚' },
};

/** Returns the model entry for a given word, or null if not found. */
export const getModel = (word: string): ModelEntry | null =>
  MODEL_REGISTRY[word.toLowerCase()] ?? null;
