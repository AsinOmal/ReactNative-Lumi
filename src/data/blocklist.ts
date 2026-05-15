/**
 * blocklist.ts
 *
 * Static profanity / inappropriate word list.
 * Merged with parent's custom blocklist at runtime in useParentalControlsStore.
 *
 * Why a static list here instead of Firestore-only:
 *   - Works offline (no network required to protect children)
 *   - Loaded synchronously at app start — no async gap where scan is active but blocklist isn't
 *   - Custom words from parents are additive on top (STATIC_BLOCKLIST ∪ customBlocklist)
 */
export const STATIC_BLOCKLIST: string[] = [
  // Profanity
  'fuck',
  'shit',
  'bitch',
  'ass',
  'asshole',
  'bastard',
  'cunt',
  'damn',
  'dick',
  'cock',
  'pussy',
  'whore',
  'slut',
  'piss',
  'crap',
  'prick',
  // Slurs (abbreviated — only identifiable tokens)
  'nigga',
  'nigger',
  'fag',
  'faggot',
  'retard',
  'spic',
  'kike',
  'chink',
  // Violence / self-harm terms
  'kill',
  'stab',
  'rape',
  'murder',
  'suicide',
  'drug',
  'drugs',
  'cocaine',
  'heroin',
  'meth',
  'porn',
  'sex',
  'nude',
  'naked',
  'boobs',
  'penis',
  'vagina',
];
