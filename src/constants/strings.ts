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
  // PIN Security section (dashboard)
  pinSecuritySectionLabel: 'PIN SECURITY',
  pinChangePinLabel: 'Change PIN',
  pinChangePinSub: 'Update your parental access PIN',
  pinForgotPinLabel: 'Forgot PIN?',
  pinForgotPinSub: "Set a new PIN — you're already verified",
  pinVerifyCurrentTitle: 'Verify Current PIN',
  pinVerifyCurrentSubtitle: 'Enter your current PIN to continue',
  pinSetNewTitle: 'Set New PIN',
  pinSetNewSubtitle: 'Choose a new 4-digit PIN',
  pinUpdateSuccess: 'PIN updated!',
  // PIN lockout
  pinLockedTitle: 'Too Many Attempts',
  pinLockedBody: (secs: number) => `Try again in ${secs}s`,
  pinContactSupport: "Can't remember? Contact support",
  pinSupportMessage: (email: string) =>
    `Hi, I've forgotten my parent PIN and need help resetting it.\nAccount: ${email}`,
  // PIN reset banner
  pinResetBannerMessage: 'Your PIN has been reset — tap here to set a new one.',
  pinResetBannerDismiss: 'Dismiss',
  // Child profile onboarding
  childProfileNameTitle: "What's your child's name?",
  childProfileNamePlaceholder: "Enter child's name",
  childProfileAgeTitle: 'How old is your child?',
  childProfileNext: 'Next',
  childProfileSkip: 'Skip',
  childProfileFinish: 'Finish',
  childProfileAgeWarning:
    'Lumi is designed for children aged 4–6. Some features may not suit older children.',

  // Parent Dashboard
  dashboardTitle: 'Parent Dashboard',
  dashboardSubtitle: 'Manage learning time & safety',
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
  hazardAlertBody:
    "It looks like there's something unsafe nearby. Please move away and find a grown-up.",
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
  downloadPack: 'Download Pack',
  downloading: 'Downloading…',
  downloaded: 'Downloaded',
  deletePack: 'Delete Pack',
  downloadSizeFmt: (mb: number) => `${mb} MB`,
  downloadProgressFmt: (done: number, total: number) =>
    `${done} of ${total} files`,
  downloadNoSpace:
    'Not enough free space on this device to download this pack.',
  downloadFailed: 'Download failed. Please try again.',
  packLocked: 'Pack Locked',
  packLockedComingSoon: 'Premium packs unlock soon.',
  packGateHeading: 'Get this pack',
  packGateSubtext: 'Download it once and play offline anytime.',
  packGateCta: 'Download',
  packGateDismiss: 'Not now',
  packFoundFmt: (word: string) => `You found "${word}"!`,

  // Onboarding (Phase C redesign)
  onboardingSlide0Title: 'Welcome to Lumi!',
  onboardingSlide0Desc:
    'Learn new words by exploring the world around you with augmented reality.',
  onboardingSlide1Title: 'Scan to Learn',
  onboardingSlide1Desc:
    'Point your camera at any printed word. Lumi will show you a 3D model and teach you how to say it.',
  onboardingSlide2Title: 'Play & Collect',
  onboardingSlide2Desc:
    'Play AR games, save favourite words, and earn achievements as you explore!',
  onboardingNext: 'Next',
  onboardingGetStarted: 'Get Started',

  // App Introduction Guide
  INTRO_SKIP: 'Skip',
  INTRO_NEXT: 'Next',
  INTRO_LETS_GO: "Let's Go!",
  INTRO_SCAN_TITLE: 'Point & Discover',
  INTRO_SCAN_BODY:
    'Tap the big Scan button in the center. Hold your camera up to any printed word and watch it come to life!',
  INTRO_PLAYGROUND_TITLE: 'Play AR Games',
  INTRO_PLAYGROUND_BODY:
    'Head to Playground to find words in AR, cook a virtual meal, or count objects as they appear!',
  INTRO_PARENT_TITLE: 'Made for Families',
  INTRO_PARENT_BODY:
    'Parents: press and hold the profile icon on Settings to set screen time limits and keep an eye on activity.',
  INTRO_LANG_TITLE: 'Choose Your Language',
  INTRO_LANG_BODY: 'How should we display word labels in the app?',
  INTRO_LANG_ENGLISH: 'English',
  INTRO_LANG_SINHALA: 'සිංහල',
  INTRO_LANG_DISCLAIMER:
    'Our scanner reads English words — that part stays English! Sinhala labels are shown alongside for learning.',

  // Premium Pack Gate
  PREMIUM_GATE_FOUND: (word: string) => `You found "${word}"!`,
  PREMIUM_GATE_SUBHEADING: (packName: string) => `Unlock the ${packName}`,
  PREMIUM_GATE_BODY: (count: number) =>
    `${count} amazing models come to life in your world`,
  PREMIUM_GATE_CTA: (price: string) => `Unlock — ${price}`,
  PREMIUM_GATE_DISMISS: 'Maybe Later',
  PACK_PRICE: '$2.99',

  // Checkout
  CHECKOUT_TITLE: 'Unlock Pack',
  CHECKOUT_CARD_NUMBER: 'Card Number',
  CHECKOUT_EXPIRY: 'MM / YY',
  CHECKOUT_CVV: 'CVV',
  CHECKOUT_CTA: 'Confirm Purchase',
  CHECKOUT_PROCESSING: 'Processing…',
  CHECKOUT_SUCCESS: 'Pack Unlocked!',
  CHECKOUT_ERROR: 'Payment failed. Please try again.',
  CHECKOUT_SIMULATED_NOTICE: 'Simulated payment — no real charge.',
  CHECKOUT_UNLOCK_BENEFIT: (count: number) =>
    `${count} 3D words become scannable after unlock.`,

  // Settings
  SETTINGS_SECTION_PROFILE: 'Profile',
  SETTINGS_EDIT_USERNAME: 'Edit Username',
  SETTINGS_LANGUAGE_SECTION: 'Language',
  SETTINGS_LANGUAGE_ROW: 'සිංහල (Sinhala)',
  SETTINGS_SECTION_PARENT: 'Parent Controls',
  SETTINGS_PARENT_DASHBOARD: 'Parent Dashboard',
  SETTINGS_SECTION_SUPPORT: 'Support',
  SETTINGS_SEND_FEEDBACK: 'Send Feedback',
  SETTINGS_SECTION_ACCOUNT: 'Account',
  SETTINGS_SIGN_OUT: 'Sign Out',

  // AR Tap-to-Place
  AR_PLACE_BUTTON: 'Place This',
  AR_PLACEMENT_SEARCHING: 'Point at a flat surface and tap',
  AR_PLACEMENT_PLACED: 'Model placed!',
  AR_PLACEMENT_REPLACE: 'Place Again',
  AR_PLACEMENT_TIMEOUT: 'No flat surface found',
  AR_PLACEMENT_TIMEOUT_SUB:
    'Make sure the surface is well-lit and not too far away.',
  AR_PLACEMENT_TRY_AGAIN: 'Try Again',
};
