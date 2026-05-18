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
  INTRO_STEP_LABEL: (n: number) => `Step ${n}`,
  INTRO_SCAN_PILL_TAP: 'Tap to scan',
  INTRO_SCAN_PILL_POINT: 'Point at a word',
  INTRO_PLAY_PILL_HUNT: 'AR Word Hunt',
  INTRO_PLAY_PILL_COOK: 'Cook & count',
  INTRO_FAMILY_PILL_TIME: 'Screen time',
  INTRO_FAMILY_PILL_ACTIVITY: 'Activity',

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

  // Auth — Login / Register / Verify / Forgot
  AUTH_TAGLINE: 'Bring words to life.',
  AUTH_LOGIN_TITLE: 'Welcome back',
  AUTH_LOGIN_SUBTITLE: 'Sign in to keep your streak going',
  AUTH_REGISTER_TITLE: 'Create your account',
  AUTH_REGISTER_SUBTITLE: 'A grown-up email keeps progress safe across devices',
  AUTH_CONTINUE_GOOGLE: 'Continue with Google',
  AUTH_CONTINUE_EMAIL: 'Continue with email',
  AUTH_OR: 'or',
  AUTH_EMAIL_PLACEHOLDER: 'Email',
  AUTH_PASSWORD_PLACEHOLDER: 'Password',
  AUTH_PASSWORD_CONFIRM_PLACEHOLDER: 'Confirm password',
  AUTH_DISPLAY_NAME_PLACEHOLDER: "Parent's name (optional)",
  AUTH_SIGN_IN_CTA: 'Sign in',
  AUTH_CREATE_ACCOUNT_CTA: 'Create account',
  AUTH_FORGOT_PASSWORD: 'Forgot password?',
  AUTH_NO_ACCOUNT: 'New here?',
  AUTH_HAS_ACCOUNT: 'Already have an account?',
  AUTH_REGISTER_LINK: 'Create an account',
  AUTH_SIGN_IN_LINK: 'Sign in',
  AUTH_TERMS_FOOTER: 'By continuing you agree to our Terms and Privacy Policy.',

  // Email verification
  VERIFY_TITLE: 'Check your inbox',
  VERIFY_BODY: 'We sent a verification link to',
  VERIFY_HINT: 'Tap the link in the email, then come back here.',
  VERIFY_CHECK_CTA: "I've verified — let me in",
  VERIFY_RESEND_CTA: 'Resend email',
  VERIFY_RESEND_COOLDOWN: (s: number) => `Resend in ${s}s`,
  VERIFY_RESENT_TOAST: 'Verification email re-sent',
  VERIFY_NOT_YET: 'Still not verified — check your inbox & spam',
  VERIFY_USE_DIFFERENT: 'Use a different account',

  // Forgot password
  FORGOT_TITLE: 'Reset password',
  FORGOT_BODY: "Enter your email and we'll send you a reset link.",
  FORGOT_SEND_CTA: 'Send reset link',
  FORGOT_SENT:
    "Check your inbox for the reset link. Didn't get it? Check spam.",
  FORGOT_BACK_TO_LOGIN: 'Back to sign in',

  // Auth error messages (Firebase code → friendly text)
  AUTH_ERR_INVALID_EMAIL: 'That email address looks off — please check it.',
  AUTH_ERR_USER_NOT_FOUND: 'No account found with that email.',
  AUTH_ERR_WRONG_PASSWORD: 'Wrong password — try again.',
  AUTH_ERR_EMAIL_IN_USE: 'An account with that email already exists.',
  AUTH_ERR_WEAK_PASSWORD: 'Password is too weak — try at least 6 characters.',
  AUTH_ERR_PASSWORDS_MISMATCH: "Passwords don't match.",
  AUTH_ERR_NETWORK: 'Network error — check your connection.',
  AUTH_ERR_TOO_MANY: 'Too many attempts — try again in a few minutes.',
  AUTH_ERR_GENERIC: 'Something went wrong. Please try again.',
};
