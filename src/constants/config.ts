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
};
