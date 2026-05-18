/**
 * Sinhala (සිංහල) UI strings.
 * Shape must match stringsEn exactly — TypeScript enforces this via StringsShape.
 *
 * TODO: All translations below need verification by a native Sinhala speaker
 * before App Store submission. Mark reviewed ones with ✓ in a comment.
 */
export const stringsSi = {
  // Scan Screen
  scanStatus: 'වචන සෙවීම…',
  cameraPermReq: 'කැමරා අවසරය අවශ්‍යයි',
  cameraUnavail: 'කැමරාව භාවිතා කළ නොහැකිය',
  saveWord: 'වචනය සුරකින්න',
  wordSaved: 'සුරකින ලදී',
  wishForIt: '⭐ ඉල්ලා සිටින්න!',
  unknownPrefix: '❓',
  unknownSuffix: 'අපගේ එකතුවේ නොමැත',

  // Packs
  fruitsPackName: 'පළතුරු ඇසුරුම',

  // Modals
  wishModalTitle: 'වචනයක් ඉල්ලා සිටින්න',

  // General
  loading: 'පූරණය වෙමින්...',
  error: 'දෝෂයක් සිදු විය',
  cancel: 'අවලංගු කරන්න',

  // Parental Controls — PIN
  pinSetTitle: 'දෙමාපිය PIN එක සකසන්න',
  pinSetSubtitle: 'දෙමාපිය සැකසුම් ආරක්ෂා කිරීමට 4-ඉලක්කම් PIN එකක් තෝරන්න',
  pinVerifyTitle: 'දෙමාපිය ප්‍රවේශය',
  pinVerifySubtitle: 'ඉදිරියට යාමට ඔබේ 4-ඉලක්කම් PIN ඇතුළු කරන්න',
  pinIncorrect: 'වැරදි PIN. නැවත උත්සාහ කරන්න.',
  // PIN Security section (dashboard)
  pinSecuritySectionLabel: 'PIN ආරක්‍ෂාව',
  pinChangePinLabel: 'PIN වෙනස් කරන්න',
  pinChangePinSub: 'ඔබේ දෙමාපිය PIN යාවත්කාලීන කරන්න',
  pinForgotPinLabel: 'PIN අමතක වුණාද?',
  pinForgotPinSub: 'නව PIN එකක් සකසන්න — ඔබ දැනටමත් තහවුරු කර ඇත',
  pinVerifyCurrentTitle: 'වත්මන් PIN තහවුරු කරන්න',
  pinVerifyCurrentSubtitle: 'ඉදිරියට යාමට ඔබේ වත්මන් PIN ඇතුළු කරන්න',
  pinSetNewTitle: 'නව PIN සකසන්න',
  pinSetNewSubtitle: 'නව 4-ඉලක්කම් PIN එකක් තෝරන්න',
  pinUpdateSuccess: 'PIN යාවත්කාලීන කරන ලදී!',
  // PIN lockout
  pinLockedTitle: 'උත්සාහයන් ඉක්මවා ගියා',
  pinLockedBody: (secs: number) => `තත්පර ${secs}කින් නැවත උත්සාහ කරන්න`,
  pinContactSupport: 'අමතක වුණාද? සහාය සොයාගන්න',
  pinSupportMessage: (email: string) =>
    `ආයුබෝවන්, දෙමාපිය PIN එක අමතක වී ඇත. reset කිරීමට සහාය අවශ්‍යයි.\nගිණුම: ${email}`,
  // PIN reset banner
  pinResetBannerMessage: 'ඔබේ PIN reset කර ඇත — නව PIN එකක් සකසන්න.',
  pinResetBannerDismiss: 'ඉවත් කරන්න',
  // Child profile onboarding
  childProfileNameTitle: 'ඔබේ දරුවාගේ නම කුමක්ද?',
  childProfileNamePlaceholder: 'දරුවාගේ නම ඇතුළු කරන්න',
  childProfileAgeTitle: 'ඔබේ දරුවාට වයස කීයද?',
  childProfileNext: 'ඊළඟ',
  childProfileSkip: 'මඟ හරින්න',
  childProfileFinish: 'නිම කරන්න',
  childProfileAgeWarning:
    'Lumi වයස 4–6 දරුවන් සඳහා සැලසුම් කර ඇත. සමහර විශේෂාංග වැඩිහිටි දරුවන්ට ගැලපෙනු නොලැබේ.',

  // Parent Dashboard
  dashboardTitle: 'දෙමාපිය උපකරණ පුවරුව',
  dashboardSubtitle: 'ඉගෙනීමේ කාලය සහ ආරක්‍ෂාව කළමනාකරණය කරන්න',
  dashboardTabTime: 'කාලය',
  dashboardTabActivity: 'ක්‍රියාකාරකම',
  dashboardTabFlagged: 'සලකුණු කළ',
  dashboardTabBlocklist: 'අවහිර ලැයිස්තුව',
  dashboardAuthTitle: 'දෙමාපිය ප්‍රදේශය',
  dashboardAuthSubtitle:
    'දෙමාපිය පාලනයන් වෙත ප්‍රවේශ වීමට ඔබේ අනන්‍යතාවය තහවුරු කරන්න.',
  dashboardAuthBtn: 'අනන්‍යතාවය තහවුරු කරන්න',
  screenTimeNoLimit: 'දෛනික සීමාවක් නැත',
  screenTimeLimitFmt: (min: number) => `${min} මිනිත්තු / දිනකට`,
  screenTimeUsedFmt: (min: number) =>
    `අද ${Math.round(min)} මිනිත්තු භාවිතා කළා`,
  screenTimeTimedModeLabel: 'කාල නියමිත ප්‍රකාරය',
  screenTimeTimedModeSub: 'Scan & Count වටවලට ගණනය කිරීමේ කාලරාමුවක් එකතු කරයි',
  activityLogEmpty: 'තවම කිසිදු ක්‍රියාකාරකමක් සටහන් කර නැත.',
  flaggedWordsEmpty: 'සලකුණු කළ වචන නැත — සියල්ල හොඳයි!',
  blocklistPlaceholder: 'අවහිර කිරීමට වචනයක් ටයිප් කරන්න...',
  blocklistAddBtn: 'එකතු කරන්න',
  blocklistEmpty: 'අභිරුචි අවහිර වචන නැත.',

  // Safety Layer
  hazardAlertTitle: 'ඉවසන්න! නවතින්න!',
  hazardAlertBody:
    'ආසන්නයේ ඇතැම් ආරක්ෂිත නොවන දෙයක් ඇති බව පෙනේ. ඉවත් වී වැඩිහිටියෙකු සොයා ගන්න.',
  hazardAlertButton: 'මමත් ආරක්ෂිතයි',

  // Maintenance Mode
  maintenanceModeTitle: 'නඩත්තු කටයුතු',
  maintenanceModeBody: 'අපි Lumi තවත් හොඳ කරමින් සිටිමු! ටිකෙන් ටික බලන්න.',

  // Parental Controls — Screen Time
  screenTimeLimitTitle: 'අද කාලය ගෙවී ගොස් ඇත!',
  screenTimeLimitBody: (used: number, limit: number) =>
    `ඔබ අද ${limit} මිනිත්තු වලින් ${used} ක් භාවිතා කළා. ඉගෙනීම හොඳයි!`,
  screenTimeLimitParentNote: 'තවත් කාලය ලබා ගැනීමට දෙමාපියෙකු ඇමතීමට.',
  screenTimeLimitUnlock: 'දෙමාපිය අගුළු ඇරීමට',

  // Pack Downloads
  downloadPack: 'ඇසුරුම බාගන්න',
  downloading: 'බාගනිමින්…',
  downloaded: 'බාගත කළා',
  deletePack: 'ඇසුරුම මකන්න',
  downloadSizeFmt: (mb: number) => `${mb} MB`,
  downloadProgressFmt: (done: number, total: number) => `${total} න් ${done}`,
  downloadNoSpace: 'මෙම ඇසුරුම බාගැනීමට ප්‍රමාණවත් ඉඩ නොමැත.',
  downloadFailed: 'බාගැනීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.',
  packLocked: 'ඇසුරුම අගුළු දමා ඇත',
  packLockedComingSoon: 'ප්‍රිමියම් ඇසුරුම් ළඟදීම.',
  packGateHeading: 'මෙම ඇසුරුම ගන්න',
  packGateSubtext: 'එකවරක් බාගෙන ඕෆ්ලයින් ක්‍රීඩා කරන්න.',
  packGateCta: 'බාගන්න',
  packGateDismiss: 'දැන් නොවේ',
  packFoundFmt: (word: string) => `ඔබ "${word}" සොයා ගත්තා!`,

  // Onboarding
  onboardingSlide0Title: 'Lumi වෙත සාදරයෙන් පිළිගනිමු!',
  onboardingSlide0Desc: 'AR භාවිතා කර ලෝකය ගවේෂණය කරමින් නව වචන ඉගෙන ගන්න.',
  onboardingSlide1Title: 'ස්කෑන් කර ඉගෙන ගන්න',
  onboardingSlide1Desc:
    'ඕනෑම මුද්‍රිත වචනයකට ඔබේ කැමරාව යොමු කරන්න. Lumi ඔබට 3D ආකෘතියක් දෙකයිය ඉගෙනීමට උදව් කරයි.',
  onboardingSlide2Title: 'ක්‍රීඩා කර එකතු කරන්න',
  onboardingSlide2Desc:
    'AR ක්‍රීඩා ක්‍රීඩා කරන්න, ප්‍රියතම වචන සුරකින්න, ගවේෂණය කරන ගමන් ජයග්‍රහණ ඉපයා ගන්න!',
  onboardingNext: 'ඊළඟ',
  onboardingGetStarted: 'ආරම්භ කරන්න',

  // App Introduction Guide
  // Note: these stay English since they show BEFORE the language is confirmed.
  // After "Let's Go!" the full app switches to Sinhala.
  INTRO_SKIP: 'Skip',
  INTRO_NEXT: 'ඊළඟ',
  INTRO_LETS_GO: 'යමු!',
  INTRO_SCAN_TITLE: 'Point & Discover',
  INTRO_SCAN_BODY:
    'Tap the big Scan button in the center. Hold your camera up to any printed word and watch it come to life!',
  INTRO_PLAYGROUND_TITLE: 'Play AR Games',
  INTRO_PLAYGROUND_BODY:
    'Head to Playground to find words in AR, cook a virtual meal, or count objects as they appear!',
  INTRO_PARENT_TITLE: 'Made for Families',
  INTRO_PARENT_BODY:
    'Parents: press and hold the profile icon on Settings to set screen time limits and keep an eye on activity.',
  INTRO_LANG_TITLE: 'ඔබේ භාෂාව තෝරන්න',
  INTRO_LANG_BODY: 'යෙදුමේ භාෂාව කුමක් වේවිද?',
  INTRO_LANG_ENGLISH: 'English',
  INTRO_LANG_SINHALA: 'සිංහල',
  INTRO_LANG_DISCLAIMER:
    'අපගේ ස්කෑනරය English වචන කියවයි — ස්කෑන් කිරීම English ලෙසම පවතී! Sinhala ලේබල් ඉගෙනීම සඳහා සමඟ දිස්වේ.',
  INTRO_STEP_LABEL: (n: number) => `පියවර ${n}`,
  INTRO_SCAN_PILL_TAP: 'ස්කෑන් කිරීමට ස්පර්ශ කරන්න',
  INTRO_SCAN_PILL_POINT: 'වචනයකට යොමු කරන්න',
  INTRO_PLAY_PILL_HUNT: 'AR වචන දඩයම',
  INTRO_PLAY_PILL_COOK: 'උයන්න සහ ගණන්',
  INTRO_FAMILY_PILL_TIME: 'තිර කාලය',
  INTRO_FAMILY_PILL_ACTIVITY: 'ක්‍රියාකාරකම',

  // Premium Pack Gate
  PREMIUM_GATE_FOUND: (word: string) => `ඔබ "${word}" සොයා ගත්තා!`,
  PREMIUM_GATE_SUBHEADING: (packName: string) => `${packName} අගුළු ඇරීමට`,
  PREMIUM_GATE_BODY: (count: number) =>
    `ආශ්චර්යමත් ආකෘති ${count}ක් ඔබේ ලෝකයට ජීව් කෙරේ`,
  PREMIUM_GATE_CTA: (price: string) => `අගුළු ඇරීමට — ${price}`,
  PREMIUM_GATE_DISMISS: 'සමහරවිට පසුව',
  PACK_PRICE: '$2.99',

  // Checkout
  CHECKOUT_TITLE: 'ඇසුරුම අගුළු ඇරීමට',
  CHECKOUT_CARD_NUMBER: 'කාඩ් අංකය',
  CHECKOUT_EXPIRY: 'MM / YY',
  CHECKOUT_CVV: 'CVV',
  CHECKOUT_CTA: 'ගෙවීම තහවුරු කරන්න',
  CHECKOUT_PROCESSING: 'සකසනිමින්…',
  CHECKOUT_SUCCESS: 'ඇසුරුම අගුළු ඇරිණා!',
  CHECKOUT_ERROR: 'ගෙවීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.',
  CHECKOUT_SIMULATED_NOTICE: 'සිමුලේෂන් ගෙවීමක් — සැබෑ ගාස්තුවක් නොමැත.',
  CHECKOUT_UNLOCK_BENEFIT: (count: number) =>
    `${count} 3D වචන අගුළු ඇරීමෙන් ස්කෑන් කළ හැකිය.`,

  // Settings
  SETTINGS_SECTION_PROFILE: 'පරිශීලක තතු',
  SETTINGS_EDIT_USERNAME: 'පරිශීලක නාමය සංස්කරණය කරන්න',
  SETTINGS_LANGUAGE_SECTION: 'භාෂාව',
  SETTINGS_LANGUAGE_ROW: 'සිංහල (Sinhala)',
  SETTINGS_SECTION_PARENT: 'දෙමාපිය පාලනය',
  SETTINGS_PARENT_DASHBOARD: 'දෙමාපිය උපකරණ පුවරුව',
  SETTINGS_SECTION_SUPPORT: 'සහාය',
  SETTINGS_SEND_FEEDBACK: 'ප්‍රතිපෝෂණ යවන්න',
  SETTINGS_SECTION_ACCOUNT: 'ගිණුම',
  SETTINGS_SIGN_OUT: 'පිටවන්න',

  // AR Tap-to-Place
  AR_PLACE_BUTTON: 'මෙය තබන්න',
  AR_PLACEMENT_SEARCHING: 'ස්ථිර මතුපිටකට යොමු කර ස්පර්ශ කරන්න',
  AR_PLACEMENT_PLACED: 'ආකෘතිය ස්ථාපිත කළා!',
  AR_PLACEMENT_REPLACE: 'නැවත ස්ථාපිත කරන්න',
  AR_PLACEMENT_TIMEOUT: 'ස්ථිර මතුපිටක් හමු නොවීය',
  AR_PLACEMENT_TIMEOUT_SUB:
    'මතුපිට හොඳින් ආලෝකමත් බවත් ඉතා දුරින් නොවන බවත් සහතික කරන්න.',
  AR_PLACEMENT_TRY_AGAIN: 'නැවත උත්සාහ කරන්න',

  // Auth — Login / Register / Verify / Forgot
  AUTH_TAGLINE: 'වචන ජීවමාන කරන්න.',
  AUTH_LOGIN_TITLE: 'ආයුබෝවන්, ආපසු සාදරයෙන් පිළිගනිමු',
  AUTH_LOGIN_SUBTITLE: 'ඔබේ දිගට යාම පවත්වා ගැනීමට පිවිසෙන්න',
  AUTH_REGISTER_TITLE: 'ගිණුමක් සාදන්න',
  AUTH_REGISTER_SUBTITLE:
    'වැඩිහිටි විද්‍යුත් තැපැලක් උපාංග අතර ඔබේ ප්‍රගතිය ආරක්ෂා කරයි',
  AUTH_CONTINUE_GOOGLE: 'Google සමඟ ඉදිරියට',
  AUTH_CONTINUE_EMAIL: 'විද්‍යුත් තැපෑලෙන් ඉදිරියට',
  AUTH_OR: 'හෝ',
  AUTH_EMAIL_PLACEHOLDER: 'විද්‍යුත් තැපෑල',
  AUTH_PASSWORD_PLACEHOLDER: 'මුරපදය',
  AUTH_PASSWORD_CONFIRM_PLACEHOLDER: 'මුරපදය තහවුරු කරන්න',
  AUTH_DISPLAY_NAME_PLACEHOLDER: 'දෙමාපියාගේ නම (අතිරේක)',
  AUTH_SIGN_IN_CTA: 'පිවිසෙන්න',
  AUTH_CREATE_ACCOUNT_CTA: 'ගිණුම සාදන්න',
  AUTH_FORGOT_PASSWORD: 'මුරපදය අමතකද?',
  AUTH_NO_ACCOUNT: 'අලුත්ද?',
  AUTH_HAS_ACCOUNT: 'දැනටමත් ගිණුමක් තිබේද?',
  AUTH_REGISTER_LINK: 'ගිණුමක් සාදන්න',
  AUTH_SIGN_IN_LINK: 'පිවිසෙන්න',
  AUTH_TERMS_FOOTER:
    'ඉදිරියට යාමෙන්, ඔබ අපගේ නියමයන් සහ රහස්‍යතා ප්‍රතිපත්තියට එකඟ වේ.',

  // Email verification
  VERIFY_TITLE: 'ඔබේ විද්‍යුත් තැපැල් පෙට්ටිය පරීක්ෂා කරන්න',
  VERIFY_BODY: 'අපි තහවුරු කිරීමේ සබැඳියක් යවා ඇත',
  VERIFY_HINT: 'විද්‍යුත් තැපෑලේ ඇති සබැඳිය ටැප් කර පසුව මෙහි ආපසු එන්න.',
  VERIFY_CHECK_CTA: 'මම තහවුරු කළා — මට ඇතුළු වීමට ඉඩ දෙන්න',
  VERIFY_RESEND_CTA: 'විද්‍යුත් තැපෑල නැවත යවන්න',
  VERIFY_RESEND_COOLDOWN: (s: number) => `තත්පර ${s}කින් නැවත යවන්න`,
  VERIFY_RESENT_TOAST: 'තහවුරු කිරීමේ විද්‍යුත් තැපෑල නැවත යැවුවා',
  VERIFY_NOT_YET: 'තවම තහවුරු කර නැත — ඔබේ පෙට්ටිය සහ ස්පෑම් පරීක්ෂා කරන්න',
  VERIFY_USE_DIFFERENT: 'වෙනත් ගිණුමක් භාවිතා කරන්න',

  // Forgot password
  FORGOT_TITLE: 'මුරපදය යළි පිහිටුවන්න',
  FORGOT_BODY:
    'ඔබේ විද්‍යුත් තැපෑල ඇතුළත් කරන්න, අපි යළි පිහිටුවීමේ සබැඳියක් එවන්නෙමු.',
  FORGOT_SEND_CTA: 'යළි පිහිටුවීමේ සබැඳිය යවන්න',
  FORGOT_SENT:
    'සබැඳිය සඳහා ඔබේ පෙට්ටිය පරීක්ෂා කරන්න. ලැබුණේ නැත්ද? ස්පෑම් පෙට්ටිය බලන්න.',
  FORGOT_BACK_TO_LOGIN: 'පිවිසුම් තිරයට ආපසු',

  // Auth error messages
  AUTH_ERR_INVALID_EMAIL:
    'එම විද්‍යුත් තැපෑල නිවැරදි බවක් නොපෙනේ — පරීක්ෂා කරන්න.',
  AUTH_ERR_USER_NOT_FOUND: 'එම විද්‍යුත් තැපෑලට ගිණුමක් හමු නොවීය.',
  AUTH_ERR_WRONG_PASSWORD: 'වැරදි මුරපදයකි — නැවත උත්සාහ කරන්න.',
  AUTH_ERR_EMAIL_IN_USE: 'එම විද්‍යුත් තැපෑලට දැනටමත් ගිණුමක් ඇත.',
  AUTH_ERR_WEAK_PASSWORD:
    'මුරපදය දුර්වලයි — අවම වශයෙන් අක්ෂර 6ක් භාවිතා කරන්න.',
  AUTH_ERR_PASSWORDS_MISMATCH: 'මුරපද ගැලපෙන්නේ නැත.',
  AUTH_ERR_NETWORK: 'ජාල දෝෂයකි — ඔබේ සම්බන්ධතාව පරීක්ෂා කරන්න.',
  AUTH_ERR_TOO_MANY:
    'ඉතා බොහෝ උත්සාහයන් — මිනිත්තු කිහිපයකින් නැවත උත්සාහ කරන්න.',
  AUTH_ERR_GENERIC: 'යමක් වැරදී ඇත. නැවත උත්සාහ කරන්න.',
};
