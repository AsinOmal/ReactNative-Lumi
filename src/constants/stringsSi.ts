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
};
