/**
 * Global configuration numbers: Timeouts, intervals, limits, distances.
 */
export const config = {
  // OCR & Debouncing
  SCAN_INTERVAL_MS: 1000,
  REQUIRED_CONSECUTIVE_FRAMES: 3,
  REQUIRED_UNKNOWN_CONSECUTIVE: 3,
  
  // Game Settings (AR Word Find)
  AR_GAME_DURATION_SEC: 60,
  AR_MODELS_TOTAL: 10,
  
  // Animations
  CARD_SLIDE_DURATION_MS: 250,
  
  // Storage & API limits
  MAX_DAILY_SCANS: 10, // Unused natively, but valid domain logic

  // Parental Controls
  SCREEN_TIME_WARNING_PERCENT: 80,  // % of daily limit at which warning state activates
  PARENT_PIN_LENGTH: 4,

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
};
