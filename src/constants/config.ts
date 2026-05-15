/**
 * Global configuration numbers: Timeouts, intervals, limits, distances.
 */
export const config = {
  APP_VERSION: '1.0.0',

  // OCR & Debouncing
  SCAN_INTERVAL_MS: 1000,
  REQUIRED_CONSECUTIVE_FRAMES: 3,
  REQUIRED_UNKNOWN_CONSECUTIVE: 3,
  
  // Game Settings (AR Word Find)
  AR_GAME_DURATION_SEC: 60,
  AR_MODELS_TOTAL: 10,

  // Game Settings (Make a Meal)
  MAKE_A_MEAL_DISTRACTOR_COUNT: 3, // wrong models spawned alongside recipe ingredients

  // Game Settings (Scan & Count)
  SCAN_AND_COUNT_ROUNDS: 5,
  SCAN_AND_COUNT_TIMER_MS: 30000,
  SCAN_AND_COUNT_DISTRACTOR_COUNT: 3,
  SCAN_AND_COUNT_PROGRESSION_STEP: 2,
  SCAN_AND_COUNT_RESET_DAYS: 7,
  SCAN_AND_COUNT_MAX_TARGETS: 10,
  
  // Animations
  CARD_SLIDE_DURATION_MS: 250,
  
  // Storage & API limits
  MAX_DAILY_SCANS: 10, // Unused natively, but valid domain logic

  // Parental Controls
  SCREEN_TIME_WARNING_PERCENT: 80,  // % of daily limit at which warning state activates
  PARENT_PIN_LENGTH: 4,
  MAX_PIN_ATTEMPTS: 5,
  PIN_LOCKOUT_MS: 60000,

  // Safety Layer (Phase 4b)
  // VNClassifyImageRequest labels that should trigger the hazard alert.
  // Using Apple's ImageNet-derived taxonomy — these are the relevant top-level identifiers.
  HAZARD_KEYWORDS: [
    'fireplace', 'fire', 'flame', 'bonfire', 'candle',
    'gun', 'rifle', 'firearm', 'weapon', 'knife', 'dagger', 'sword',
    'pill', 'medication', 'syringe', 'needle',
    'alcohol', 'beer', 'wine', 'liquor',
    'cigarette', 'tobacco', 'smoking',
    'explosion', 'bomb',
  ] as string[],
  HAZARD_CHECK_INTERVAL_MS: 5000,  // classify every 5s — less aggressive than OCR loop
  HAZARD_COOLDOWN_MS: 30000,       // suppress repeat alerts for 30s after dismiss

  // Pack Downloads (Phase 10)
  // Concurrency caps parallel asset fetches per pack — too high spikes memory and stalls Wi-Fi on weak networks.
  DOWNLOAD_CONCURRENCY: 3,
  // Pre-flight free-space guard. We refuse to start a download if the device has less than this many bytes free.
  // 50 MB > the largest single pack (≈15 MB) plus headroom for partial-write tmp files.
  DOWNLOAD_MIN_FREE_BYTES: 50 * 1024 * 1024,
  // Subdirectories under DocumentDirectoryPath. Permanent storage, NOT cache — iOS will not purge under pressure.
  MODELS_CACHE_SUBDIR: "lumi_models",
  AUDIO_CACHE_SUBDIR: "lumi_audio",
  // AsyncStorage key for the stale-while-revalidate remote pack-metadata mirror.
  REMOTE_MODELS_CACHE_KEY: "@lumi/remote_models_cache",
  // AR tap-to-place: seconds before "no surface found" timeout
  AR_PLACEMENT_TIMEOUT_MS: 15000,
};
