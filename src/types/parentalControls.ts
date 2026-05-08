/**
 * parentalControls.ts
 *
 * TypeScript interfaces for the Parental Controls system.
 * Mirrors the Firestore schema settled in Phase 4a.
 */

/** Stored at /users/{uid}/parentSettings */
export interface ParentSettings {
  dailyLimitMinutes: number;       // 0 = no limit
  timedModeEnabled: boolean;       // enables per-round timer in Scan & Count
  customBlocklist: string[];       // parent-added words, merged with STATIC_BLOCKLIST
  pinHash: string | null;          // sha256 of 4-digit PIN; null = not set
  updatedAt: number;               // epoch ms
}

/** Stored at /users/{uid}/activityLog/{autoId} */
export interface ActivityLogEntry {
  word: string;           // word that was scanned
  timestamp: number;      // epoch ms
  flagged: boolean;       // true when word matched blocklist
  source: 'ocr_scan' | 'ar_word_find' | 'pack_gate';  // extensible as new game modes are added
}

/** Stored at /users/{uid}/screenTime/{YYYY-MM-DD} */
export interface ScreenTimeRecord {
  totalMinutes: number;
}
