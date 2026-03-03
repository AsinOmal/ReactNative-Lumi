# 🌟 Lumi — AR Word Explorer

> *"Every word a child sees in the real world becomes an interactive 3D experience — making reading the game, not just a way to play one."*

Lumi is a mobile application for children aged **5–10** that uses **Augmented Reality (AR)** and **Optical Character Recognition (OCR)** to bring words to life as 3D models in the real world. A child points their phone's camera at any written word — in a book, on a label, on a cereal box — and the matching 3D animated model appears anchored in the physical space around them.

---

> [!CAUTION]
> **This app is designed to run on physical devices ONLY.**
> AR features rely on ARKit (iOS) and ARCore (Android) — neither of which is available on simulators or emulators. Do not attempt to run Lumi on the iOS Simulator or Android Emulator — it will not work.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native (Bare CLI) |
| AR Engine | `@reactvision/react-viro` (ViroReact) |
| 3D Models | `.glb` (binary GLTF) |
| Auth | Firebase Auth (Google Sign-in) |
| Database | Firebase Firestore |
| State | Zustand |
| Navigation | React Navigation (Bottom Tabs) |
| Icons | react-native-vector-icons (Ionicons) |

---

## Prerequisites

Before installing, make sure you have:

- **Node.js** ≥ 18
- **Xcode** ≥ 15 (for iOS builds)
- **Android Studio** + NDK (for Android builds)
- **CocoaPods** (for iOS native dependencies)
- **A physical iOS or Android device** (AR will not run on simulators/emulators)
- A Firebase project with:
  - Google Sign-in enabled
  - Firestore database created
  - `GoogleService-Info.plist` (iOS) and `google-services.json` (Android) downloaded

---

## Installation

### 1. Clone and install dependencies

```bash
git clone https://github.com/AsinOmal/ReactNative-Lumi.git
cd ReactNative-Lumi
npm install
```

### 2. Add Firebase config files

Place your Firebase config files in the correct locations:

```
ios/Lumi/GoogleService-Info.plist
android/app/google-services.json
```

> These files are gitignored. You must obtain them from your Firebase Console → Project Settings → Your Apps.

### 3. iOS — Install Pods

```bash
cd ios
pod install
cd ..
```

> Minimum iOS deployment target: **15.1** (required by ViroReact + react-native-screens)

### 4. iOS — Add URL scheme for Google Sign-in

In Xcode, open `ios/Lumi/Info.plist` and add your `REVERSED_CLIENT_ID` from `GoogleService-Info.plist` as a URL scheme under `CFBundleURLTypes`. (This is required for Google Sign-in redirect to work.)

### 5. iOS — Register the Ionicons font

Add `Ionicons.ttf` to `UIAppFonts` in `Info.plist`:

```xml
<key>UIAppFonts</key>
<array>
  <string>Ionicons.ttf</string>
</array>
```

> [!NOTE]
> The font file is located in `node_modules/react-native-vector-icons/Fonts/Ionicons.ttf`. You do not need to copy it manually — the build process handles it when the font is declared in `Info.plist`.

---

## Running the App

### Start Metro

```bash
npm start
```

### Run on iOS (physical device)

1. Open `ios/Lumi.xcworkspace` in Xcode (not `.xcodeproj`)
2. Select your connected physical iPhone as the target
3. Press **Run** (⌘R)

### Run on Android (physical device)

Enable **USB debugging** on your device, then:

```bash
npm run android
```

---

## Project Structure

```
src/
├── assets/
│   ├── fonts/          # Fredoka, SpicyRice, CatchyMelody
│   ├── models/
│   │   └── fruits/     # 10 GLB models (apple, banana, cherry…)
│   └── sounds/
├── components/
│   ├── ar/
│   │   └── ARWordScene.tsx   # Viro AR scene with tap-to-place
│   ├── home/
│   └── library/
├── navigation/
│   ├── AppRoutes.tsx         # Auth-gated routing
│   └── MainTabNavigator.tsx  # Custom floating pill tab bar
├── screens/
│   ├── HomeScreen.tsx        # Explore packs + live Firestore data
│   ├── LoginScreen.tsx       # Google Sign-in
│   ├── ProfileScreen.tsx
│   └── ScanScreen.tsx        # AR tap-to-place experience
├── services/
│   ├── packService.ts        # Firestore pack seeding & fetching
│   └── userService.ts        # Firestore user document management
├── store/
│   ├── useAuthStore.ts       # Zustand auth state
│   └── usePackStore.ts       # Zustand pack data state
└── utils/
    └── modelRegistry.ts      # word → GLB file + scale mapping
```

---

## Features (Phase 1 & 2 — Current)

- ✅ Google Sign-in with Firebase Auth
- ✅ Firestore user profiles (auto-created on first sign-in)
- ✅ Firestore `packs` collection (seeded on first launch)
- ✅ HomeScreen with live pack data from Firestore
- ✅ Custom floating-pill tab bar (Home / Scan / Profile)
- ✅ AR scene with tap-to-place model anchoring
- ✅ Surface detection reticle (purple disc shows where model will land)
- ✅ 10 fruit 3D models loaded from bundled GLB files
- ✅ Per-word fun facts and result card
- ✅ Slow rotation animation on placed models

## Planned (Phases 3–10)

- 🔲 OCR text recognition via ML Kit (Phase 3)
- 🔲 Real-world word-to-model pipeline (Phase 3)
- 🔲 Pronunciation audio & syllable breakdown (Phase 4)
- 🔲 Daily Word Hunt missions (Phase 5)
- 🔲 Badge & achievement system (Phase 5)
- 🔲 Parent Dashboard (Phase 6)
- 🔲 AI fun facts via Claude API (Phase 7)
- 🔲 In-app purchases & premium packs (Phase 8)

---

## Pack System

Lumi uses a **pack-based content system**:

| Pack | Type | Words |
|---|---|---|
| Fruits | Free (bundled) | Apple, Banana, Cherry, Grape, Lemon, Mango, Orange, Pineapple, Strawberry, Watermelon |
| Vegetables | Free (coming soon) | Carrot, Tomato, Brinjal, Potato… |
| Dinosaurs | Premium — $1.99 | T-Rex, Triceratops, Brachiosaurus… |
| Space | Premium — $1.99 | Rocket, Planet, Astronaut… |
| Deep Ocean | Premium — $1.99 | Anglerfish, Blue Whale, Giant Squid… |

---

## Known Limitations

- AR requires good ambient lighting — very dark environments may reduce surface detection accuracy
- Orange and Strawberry GLB models have PBR metallic-roughness materials that appear with reduced colour without an IBL environment (replacement models planned)
- Simulators / Emulators: **not supported** — AR will crash or produce a black screen

---

## Final Year Project

Lumi is developed as a Final Year Project submission. The full product vision, technical architecture, monetisation strategy, and UX design rationale are documented in [`Lumi_Blueprint.md`](./Lumi_Blueprint.md).

---

*Built with React Native, ViroReact, Firebase, and a lot of ☕*
