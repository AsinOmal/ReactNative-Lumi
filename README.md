# Lumi — AR Word Explorer

> *"Every word a child sees in the real world becomes an interactive 3D experience."*

Lumi is an iOS app for children aged **4–10** that uses Augmented Reality and OCR to bring words to life. Point the camera at any written word — in a book, on a label, on a cereal box — and the matching 3D model appears in the real world.

**Core loop:** scan → recognise → see it in 3D → learn it.

---

> [!CAUTION]
> **iOS physical device only.** AR runs on ARKit via ViroReact — it will not work on the iOS Simulator. All development and testing must be done on a physical iPhone.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native (Old Architecture — required by ViroReact) |
| AR Engine | `@reactvision/react-viro` (ViroReact) |
| OCR | Vision Camera + `LumiVisionOCR.swift` (Apple VNRecognizeTextRequest) |
| 3D Models | `.glb` (binary GLTF) — bundled + remote via Firebase Storage |
| Auth | Firebase Auth (Google Sign-In) |
| Database | Cloud Firestore |
| Storage | Firebase Storage (admin-uploaded GLB/MP3 assets) |
| Push Notifications | `@react-native-firebase/messaging` + `@notifee/react-native` |
| Cloud Functions | Firebase Functions (FCM broadcast dispatcher) |
| State | Zustand |
| Navigation | React Navigation (Stack + Bottom Tabs) |
| Icons | react-native-vector-icons (Ionicons + MaterialCommunityIcons) |
| Admin Dashboard | Vite + React + TypeScript, deployed on Firebase Hosting |

---

## Features

### Core
- Google Sign-In with Firebase Auth
- OCR pipeline: Vision Camera → native Swift bridge → VNRecognizeTextRequest (centre-cropped), two-pass Levenshtein word matching, 3-frame debounce to prevent false positives
- AR Word Find game — 60s timer, 10 fruit models, scoring, SFX
- Make a Meal game — recipe select, AR ingredient scanning
- Scan & Count game — progressive difficulty, 7-day reset, Firestore progress sync
- Fruits pack — 10 hand-calibrated GLB models with `.mp3` pronunciation audio

### Content & Packs
- Vegetables pack (10 GLBs bundled, pending scale calibration on device)
- Vehicles pack (10 GLBs bundled, pending scale calibration on device)
- Remote content integration — admin-uploaded packs and models served from Firebase Storage, merged with local seed at boot

### User Features
- Achievement system — 7 achievements, Firestore-synced, shareable
- Saved words — Firestore-backed dual-tab screen
- Daily Word Hunt with streak tracking
- Daily streak reminder notification at 8pm via `@notifee`
- Safety layer — `VNClassifyImageRequest` every 5s, hazard overlay with 30s cooldown
- Parental controls — PIN/biometric gate, custom blocklist, screen time limit, activity log

### Admin Dashboard
A separate web app (Vite + React) deployed on Firebase Hosting with Google Sign-In gated to admin-claim accounts:
- **Content** — create/edit packs and models, upload GLB/MP3 files with progress, publish/draft toggle
- **Users** — paginated user table, full profile view, suspend/delete account, grant achievements
- **Analytics** — DAU, new signups, top scanned words, game usage (Recharts)
- **Moderation** — global blocklist (merged into all users), flagged scan events, hazard detection log
- **Notifications** — broadcast FCM push (Cloud Function) + in-app dismissable banner
- **App Config** — feature flags (kill-switches per game), game constants, maintenance mode
- **Revenue** — purchase table with manual unlock for support cases
- **Feedback** — in-app feedback inbox with unread badge

---

## Architecture Notes

### Old Architecture only
ViroReact is permanently incompatible with React Native's New Architecture (JSI/Fabric). New Arch is disabled in the iOS build. All native modules use the standard `NativeModule` bridge (`LumiVisionOCR.swift` / `LumiVisionOCR.m`).

### Two-phase camera
Vision Camera and ViroReact cannot run simultaneously — they share the same hardware. A `ScanMode` enum (`'scan' | 'ar'`) controls which is mounted. Camera must be `isActive={isAppActive && isFocused}` — losing focus releases the hardware for ViroReact to claim it.

### Remote content
Admins upload GLBs and MP3s via the dashboard → stored in Firebase Storage → URLs saved in Firestore `adminModels/{word}` → mobile fetches at boot → `modelRegistry.getModel()` checks remote first, falls back to bundled assets. No app update needed for new content.

---

## Project Structure

```
├── src/
│   ├── assets/
│   │   ├── fonts/              # Fredoka
│   │   ├── models/
│   │   │   ├── fruits/         # 10 calibrated GLBs
│   │   │   ├── vegetables/     # 10 GLBs (pending calibration)
│   │   │   └── vehicles/       # 10 GLBs (pending calibration)
│   │   └── audio/              # .mp3 pronunciation files (fruits)
│   ├── components/
│   │   ├── ar/                 # ViroReact AR scene components
│   │   ├── home/               # BannerAnnouncement, HomeHeaderSection
│   │   ├── library/            # ColorPackCard
│   │   └── settings/           # FeedbackModal, SettingsRow
│   ├── constants/              # colors.ts, config.ts, strings.ts
│   ├── data/                   # blocklist.ts
│   ├── hooks/                  # useBootstrapSession, useScanOCR, useRemoteConfig…
│   ├── navigation/
│   │   ├── AppRoutes.tsx       # Auth gate + boot-time remote content fetch
│   │   └── MainTabNavigator.tsx
│   ├── screens/                # One file per screen, max 150 lines
│   ├── services/               # Firebase, OCR, notifications, purchases
│   ├── store/                  # Zustand stores (auth, pack, parental controls, remote content)
│   ├── types/                  # TypeScript interfaces
│   └── utils/                  # modelRegistry.ts, wordMatcher.ts, dailyWordHunt.ts…
├── ios/
│   └── LumiVisionOCR.swift     # Native OCR bridge (VNRecognizeTextRequest)
├── admin/                      # Web admin dashboard (Vite + React)
│   └── src/
│       ├── hooks/              # usePacks, useModels, useUsers, useAnalytics…
│       ├── screens/            # 8 admin screens
│       └── styles/             # CSS variables + global styles
├── functions/
│   └── src/index.ts            # FCM broadcast Cloud Function
└── firestore.rules
```

---

## Pack System

| Pack | Status | Words |
|---|---|---|
| Fruits | Free — calibrated ✅ | Apple, Banana, Cherry, Grape, Lemon, Mango, Orange, Pineapple, Strawberry, Watermelon |
| Vegetables | Free — calibration pending | Broccoli, Carrot, Chili, Corn, Cucumber, Eggplant, Onion, Potato, Pumpkin, Tomato |
| Vehicles | Free — calibration pending | Bicycle, Boat, Bus, Car, Helicopter, Plane, Rocket, Tractor, Train, Truck |
| Dinosaurs | Premium (planned) | — |
| Space | Premium (planned) | — |

New packs and models can be published by admins at any time without an app update.

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- Xcode ≥ 15
- CocoaPods
- Physical iPhone (AR will not run on the simulator)
- Firebase project with Google Sign-In and Firestore enabled
- `GoogleService-Info.plist` placed at `ios/Lumi/GoogleService-Info.plist`

### Install

```bash
git clone https://github.com/AsinOmal/ReactNative-Lumi.git
cd ReactNative-Lumi
npm install
cd ios && pod install && cd ..
```

`patch-package` runs automatically on `npm install` and applies the ViroReact prop-spread crash fix — do not skip it.

### iOS setup (one-time)

1. Open `ios/Lumi.xcworkspace` in Xcode
2. Add your `REVERSED_CLIENT_ID` from `GoogleService-Info.plist` as a URL scheme under `CFBundleURLTypes` in `Info.plist` (required for Google Sign-In)
3. Enable **Push Notifications** capability under Signing & Capabilities (required for FCM)

### Run

```bash
npm start          # Metro bundler
# Then press Run (⌘R) in Xcode with a physical device selected
```

### Admin dashboard (local)

```bash
cd admin
cp .env.example .env   # fill in your Firebase config
npm install
npm run dev
```

---

## Pending Work

| Item | Phase |
|---|---|
| Calibrate vegetables + vehicles GLBs on device | 10 |
| Source 20 `.mp3` audio files (vegetables + vehicles) | 10 |
| Deploy FCM Cloud Function (`cd functions && npm run deploy`) | 9-tail |
| In-app purchases (`react-native-iap`) | 11 |
| Replace `HazardAlertOverlay` emoji with Ionicons `warning` | 12 |
| Wire UI sounds (`save_chime.mp3`, `achievement_unlock.mp3`) | 12 |
| App Store submission (screenshots, `PrivacyInfo.xcprivacy`, COPPA) | 12 |

---

## Known Limitations

- AR requires good ambient lighting — dark environments reduce surface detection accuracy
- Vegetables and vehicles packs are bundled but scale-uncalibrated; they fall back to a 0.1 baseline that will not look correct in AR until calibrated on a physical device
- Remote models (admin-uploaded) require an internet connection — no offline binary cache

---

*Final Year Project — built with React Native, ViroReact, Firebase, and a lot of ☕*
