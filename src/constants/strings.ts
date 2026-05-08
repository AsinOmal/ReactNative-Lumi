/**
 * Global UI strings to prevent hardcoding text in components.
 */
export const strings = {
  // Scan Screen
  scanStatus: 'Scanning for words…',
  cameraPermReq: 'Camera permission required',
  cameraUnavail: 'Camera unavailable',
  saveWord: 'Save Word',
  wordSaved: 'Saved',
  wishForIt: '⭐ Wish for it!',
  unknownPrefix: '❓',
  unknownSuffix: "isn't in our collection yet",
  
  // Packs
  fruitsPackName: 'Fruits Pack',
  
  // Modals
  wishModalTitle: 'Wish for a word',
  
  // General
  loading: 'Loading...',
  error: 'An error occurred',
  cancel: 'Cancel',

  // Parental Controls — PIN
  pinSetTitle: 'Set Your Parental PIN',
  pinSetSubtitle: 'Choose a 4-digit PIN to protect parent settings',
  pinVerifyTitle: 'Parent Access',
  pinVerifySubtitle: 'Enter your 4-digit PIN to continue',
  pinIncorrect: 'Incorrect PIN. Try again.',

  // Parent Dashboard
  dashboardTitle: 'Parent Dashboard',
  dashboardTabTime: 'Time',
  dashboardTabActivity: 'Activity',
  dashboardTabFlagged: 'Flagged',
  dashboardTabBlocklist: 'Blocklist',
  dashboardAuthTitle: 'Parent Area',
  dashboardAuthSubtitle: 'Verify your identity to access parental controls.',
  dashboardAuthBtn: 'Verify Identity',
  screenTimeNoLimit: 'No daily limit',
  screenTimeLimitFmt: (min: number) => `${min} min / day`,
  screenTimeUsedFmt: (min: number) => `${Math.round(min)} min used today`,
  screenTimeTimedModeLabel: 'Timed Mode',
  screenTimeTimedModeSub: 'Adds a countdown timer to Scan & Count rounds',
  activityLogEmpty: 'No activity recorded yet.',
  flaggedWordsEmpty: 'No flagged words — all clear!',
  blocklistPlaceholder: 'Type a word to block...',
  blocklistAddBtn: 'Add',
  blocklistEmpty: 'No custom blocked words.',

  // Safety Layer
  hazardAlertTitle: 'Whoa! Stop right there!',
  hazardAlertBody: "It looks like there's something unsafe nearby. Please move away and find a grown-up.",
  hazardAlertButton: "I'm Safe Now",

  // Maintenance Mode
  maintenanceModeTitle: 'Down for Maintenance',
  maintenanceModeBody: "We're making Lumi even better! Check back soon.",

  // Parental Controls — Screen Time
  screenTimeLimitTitle: "Time's Up for Today!",
  screenTimeLimitBody: (used: number, limit: number) =>
    `You've used ${used} of ${limit} minutes today. Great job learning!`,
  screenTimeLimitParentNote: 'Ask a parent to unlock more time.',
  screenTimeLimitUnlock: 'Parent Unlock',

  // Pack Downloads (Phase 10)
  downloadPack: "Download Pack",
  downloading: "Downloading…",
  downloaded: "Downloaded",
  deletePack: "Delete Pack",
  downloadSizeFmt: (mb: number) => `${mb} MB`,
  downloadProgressFmt: (done: number, total: number) =>
    `${done} of ${total} files`,
  downloadNoSpace:
    "Not enough free space on this device to download this pack.",
  packLocked: "Pack Locked",
  packLockedComingSoon: "Premium packs unlock soon.",
  packGateHeading: "Get this pack",
  packGateSubtext: "Download it once and play offline anytime.",
  packGateCta: "Download",
  packGateDismiss: "Not now",
};
