# 🦊 UC Browser Clone (React Native + Expo Prebuild + Kotlin)

<p align="center">
  <img src="./assets/icon.png" width="100" height="100" alt="UC Browser Logo" style="border-radius: 20px;" />
</p>

<p align="center">
  <strong>A 1:1 Pixel-Perfect & Fully Functional UC Browser Clone built with Expo Prebuild and Native Android Kotlin Modules.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Expo-SDK%2052-000020?style=for-the-badge&logo=expo" alt="Expo SDK 52" />
  <img src="https://img.shields.io/badge/React%20Native-0.76-61DAFB?style=for-the-badge&logo=react" alt="React Native" />
  <img src="https://img.shields.io/badge/Kotlin-Native%20Modules-7F52FF?style=for-the-badge&logo=kotlin" alt="Kotlin" />
  <img src="https://img.shields.io/badge/Android-API%2024%2B-3DDC84?style=for-the-badge&logo=android" alt="Android" />
</p>

---

## 🚀 Overview

This repository contains a full-featured, high-performance **UC Browser Clone** recreating the iconic UC browsing experience with native Kotlin acceleration, background download capabilities, ad blocking, media sniffing, and privacy features.

---

## 🌟 Key Features

### 🎨 1. Iconic UC Browser UI & Design
* **Classic 5-Button Bottom Navigation Bar**:
  * ◀️ `Back` | ▶️ `Forward` | 🏠 `Home` | 🔲 `Live Tab Counter Badge` | ☰ `UC 3-Line Menu`.
* **Signature Speed Dial Homepage**:
  * Curved search omnibox with instant engine switcher (**Google, Bing, DuckDuckGo, Yahoo**).
  * 2-row rounded shortcut icons (**Google, YouTube, Facebook, Amazon, Wikipedia, Instagram, Cricket, Twitter/X**) with status badges (`HOT`, `LIVE`) and `+ Add` button.
  * Real-time categorized **UC News cards** (Headlines, Cricket, Tech, Cinema).
* **Slide-Up 9/12 Grid UC Drawer Menu**:
  * Instant toggles for **Downloads**, **Night Mode**, **AdBlocker**, **Incognito**, **Desktop Site**, **Speed Mode**, **Bookmarks/History**, **No Image Mode**, and **Settings**.
* **3D Card Tab Switcher**:
  * Card carousel grid with live previews, individual close triggers, "+ New Tab", "Close All", and seamless **Standard vs. Incognito Mode** toggle (with stealth purple theme).

---

### ⚙️ 2. Native Android (Kotlin) Engine
* **High-Speed Multi-Threaded Download Manager** (`UCDownloadManagerModule.kt`):
  * Multi-part chunked background downloads with HTTP range resume support.
  * Real-time download speed calculation (`KB/s`, `MB/s`) and dynamic progress broadcast.
  * Android Notification Channel with live progress bar and direct file opening via `FileProvider`.
* **Picture-in-Picture (PiP) Window** (`UCPiPModule.kt`):
  * Native floating player mode for web videos.

---

### 🛡️ 3. JavaScript Injection Engines
* **AdBlocker Engine** (`AdBlockEngine.ts`):
  * Real-time DOM element blocking, ad iframe neutralization, and popup suppression.
* **HTML5 Video Stream Sniffer** (`MediaSniffer.ts`):
  * Automatic detection of playing streaming media (`<video>`, `.mp4`, `.m3u8`, blobs).
  * Triggers the floating orange **UC Video Assistant Pill** for 1-tap download or PiP mode.
* **Intelligent Night Mode Engine** (`NightModeEngine.ts`):
  * Inverts background luminance and CSS stylesheets while preserving media (photos, videos).

---

## 📁 Project Structure

```
├── android/                                 # Native Android Prebuild Project
│   └── app/src/main/java/com/iuc/browser/
│       ├── MainActivity.kt                  # Main Activity (PiP & Window flags)
│       ├── MainApplication.kt               # Application Entry & Package Registrar
│       ├── UCBrowserPackage.kt              # Native Module Package Registry
│       ├── download/
│       │   └── UCDownloadManagerModule.kt   # Multi-threaded Kotlin Download Manager
│       └── pip/
│           └── UCPiPModule.kt               # Native Picture-in-Picture Module
├── src/
│   ├── components/
│   │   ├── HeaderSearchBar.tsx              # Omnibox, Engine Picker & Progress Bar
│   │   ├── BottomToolbar.tsx                # Classic 5-button UC Navigation Bar
│   │   ├── SpeedDialGrid.tsx                # 2-Row rounded shortcut grid + Add Modal
│   │   ├── NewsFeedSection.tsx              # UC Homepage News cards & tabs
│   │   ├── UCMenuDrawer.tsx                 # 9/12 Grid Slide-Up Modal
│   │   ├── TabSwitcherModal.tsx             # Card deck multi-tab switcher
│   │   └── VideoAssistantBar.tsx            # Floating Video Sniffer Pill
│   ├── screens/
│   │   ├── BrowserScreen.tsx                # Main container integrating tabs & WebViews
│   │   ├── DownloadManagerScreen.tsx        # Downloading & Completed manager
│   │   ├── BookmarksHistoryScreen.tsx       # Bookmarks & History manager
│   │   └── SettingsScreen.tsx               # Search Engine, AdBlock, & Privacy controls
│   ├── services/
│   │   ├── NativeDownloadService.ts         # Bridge to Kotlin UCDownloadManager
│   │   ├── StorageService.ts                # AsyncStorage persistence layer
│   │   ├── AdBlockEngine.ts                 # Ad-filtering script
│   │   ├── MediaSniffer.ts                  # Video stream detector
│   │   └── NightModeEngine.ts               # Night mode CSS engine
│   ├── constants/
│   └── types/
├── App.tsx                                  # Root App entry
└── package.json
```

---

## 📦 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Android Studio & Android SDK](https://developer.android.com/studio) (API 24+)
- JDK 17 or 21

### 1. Installation
```bash
git clone <YOUR_REPO_URL>
cd "iuc browser"
npm install
```

### 2. Start the Development Server
```bash
npx expo start
```

### 3. Run on Android Device or Emulator
```bash
npx expo run:android
```

### 4. Build Debug / Release APK
```bash
cd android
./gradlew assembleDebug
# Generated APK will be at:
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

