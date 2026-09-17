# 🦊 IUC Browser — Quantum Gecko Edition

<p align="center">
  <img src="./assets/icon.png" width="100" height="100" alt="IUC Browser Logo" style="border-radius: 20px;" />
</p>

<p align="center">
  <strong>Next-Generation, Privacy-First Android Browser Powered by Mozilla GeckoView (Firefox Quantum Engine), Multi-Tier Ad Blocking, and Native Background Download Manager.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Engine-Mozilla%20GeckoView%20139-FF7139?style=for-the-badge&logo=firefox" alt="GeckoView" />
  <img src="https://img.shields.io/badge/React%20Native-0.76-61DAFB?style=for-the-badge&logo=react" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-SDK%2052-000020?style=for-the-badge&logo=expo" alt="Expo SDK 52" />
  <img src="https://img.shields.io/badge/Kotlin-Native%20Modules-7F52FF?style=for-the-badge&logo=kotlin" alt="Kotlin" />
  <img src="https://img.shields.io/badge/AdBlock-Multi--Tier%20Shield-E53E3E?style=for-the-badge" alt="AdBlock" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="MIT License" />
</p>

---

## 🚀 Overview

**IUC Browser** is an open-source Android browser that pairs the performance of **Mozilla GeckoView (Firefox Quantum 139)** with a React Native interface and native Kotlin system integrations.

Designed from the ground up for strict privacy, speed, and media usability, IUC Browser eliminates intrusive ad tracking, suppresses popunder clickjacking networks, blocks email spy pixels, and features a full-fledged OS-level background download manager.

---

## 🛡️ Feature Matrix & Privacy Capabilities

| **Authentic UC Browser UI** | ✅ Supported | Classic UC Orange `#FF6E00`, curved omnibox, 2-row speed dial with badges, 16-grid drawer, 5-button toolbar |
| **Custom Download Manager** | ✅ Supported | Total speed calculation (`⚡ Total: X MB/s`), byte-range resume, expired link renewal (`🔗 Update Link`) |
| **Simultaneous Download Limit** | ✅ Supported | User-configurable concurrency limiter (1 to 6 simultaneous downloads) with background queueing |
| **Mozilla GeckoView Core** | ✅ Supported | Firefox Quantum engine with multi-process sandboxing & WebExtensions |
| **Native Ad Blocker** | ✅ Supported | Multi-tier shield: native Java interceptor, GeckoView ETP, and in-DOM script rules |
| **Popunder & Clickjack Shield** | ✅ Supported | Blocks `.cfd`, `.click`, `pt=tabup`, affiliate clickjacks, and rogue `window.open` tabs |
| **Blocks 3rd-Party Trackers** | ✅ Supported | Total Cookie Protection + GeckoView Strict Enhanced Tracking Protection |
| **Blocks Cookie Consent Pop-ups**| ✅ Supported | Automatic rejection and hiding of OneTrust, Cookiebot, and GDPR banners |
| **YouTube Ad Immunity** | ✅ Supported | Automated fast-forwarding, banner removal, and silent skip for video ads |
| **Private Search Default** | ✅ Supported | Privacy-respecting defaults: DuckDuckGo, Brave Search, Startpage |
| **Private AI Assistant** | ✅ Supported | Built-in offline-ready conversational AI assistant for summaries and queries |
| **Built-in Password Vault** | ✅ Supported | Master PIN-secured credentials vault with 16-character strong password generator |
| **Blocks Email Spy Pixels** | ✅ Supported | Identifies and purges 1x1 tracking GIF beacons and stealth spy pixels |
| **One-Tap 🔥 Session Nuke** | ✅ Supported | Instant destruction of browsing history, cookies, session cache, and active tabs |
| **Data Broker Removal Service** | ✅ Supported | Built-in registry and 1-tap opt-out portal for data brokers and search engines |
| **Identity Theft Restoration** | ✅ Supported | Integrated HaveIBeenPwned email breach lookup and guided response checklists |
| **Built-in Tor / SOCKS5 Proxy** | ✅ Supported | Direct routing through Tor or custom SOCKS5 proxies with DNS-over-HTTPS (DoH) |
| **Workspaces / Tab Groups** | ✅ Supported | Color-coded tab groups for Work, Personal, Research, and Entertainment |
| **Split-Screen Dual Browsing** | ✅ Supported | Side-by-side simultaneous GeckoView browsing in a single view |
| **Card Tabs with Swipe-Up** | ✅ Supported | 2-column interactive card deck with smooth upward swipe-to-close gestures |
| **Anti-Fingerprinting Shield** | ✅ Supported | Canvas, WebGL, and AudioContext randomization; Battery API spoofing |
| **WebExtensions Support** | ✅ Supported | Built-in Firefox WebExtension runtime with manifest-based content filtering |
| **Cross-Device Sync & Backup** | ✅ Supported | Encrypted JSON configuration export and import for seamless migration |
| **Distraction-Free Reader Mode** | ✅ Supported | Readability extraction with Dark, Sepia, and Light themes + adjustable fonts |
| **Live URL & Ad HUD Logger** | ✅ Supported | Real-time security event telemetry with toolbar counter badge and inspector |

---

## 🏗️ Architecture

```
                               ┌─────────────────────────────┐
                               │   React Native Frontend     │
                               │   (BrowserScreen.tsx)       │
                               └──────────────┬──────────────┘
                                              │
                    ┌─────────────────────────┴─────────────────────────┐
                    │                                                   │
         ┌──────────▼──────────┐                             ┌──────────▼──────────┐
         │  GeckoBrowserView   │                             │   DownloadManager   │
         │  (React Native)     │                             │   (TypeScript)      │
         └──────────┬──────────┘                             └──────────┬──────────┘
                    │ React Native Bridge                               │ Bridge
         ┌──────────▼──────────┐                             ┌──────────▼──────────┐
         │  UCWebEngineView    │                             │ UCDownloadManager   │
         │  (Kotlin)           │                             │ Module (Kotlin)     │
         └──────────┬──────────┘                             └──────────┬──────────┘
                    │                                                   │
    ┌───────────────┼───────────────┐                        ┌──────────▼──────────┐
    │               │               │                        │ Native Multi-Thread │
┌───▼────┐    ┌─────▼─────┐   ┌─────▼─────┐                  │ Range Resume Engine │
│ Gecko  │    │ AdBlocker │   │ Extension │                  │ (HTTP 206 Partial,  │
│ Engine │    │ (Java)    │   │ Module    │                  │  Queue & Speed Calc)│
└────────┘    └───────────┘   └───────────┘                  └─────────────────────┘
```

1. **Mozilla GeckoView Engine (`UCWebEngineView.kt`)**:
   - Replaces the generic WebView with Firefox's GeckoView Quantum engine (`org.mozilla.geckoview:geckoview-omni:139`).
   - Implements native delegates: `NavigationDelegate`, `ContentBlocking.Delegate`, and `ProgressDelegate`.
   - Isolates cross-origin storage, blocks fingerprinting scripts, and controls popups cleanly.

2. **Multi-Tier Ad Blocking**:
   - **Native Java Interceptor (`AdBlocker.java`)**: Filters 300+ known ad/tracking domains, disposable popunder TLDs (`.cfd`, `.click`, `.buzz`), and affiliate redirect patterns before requests hit the network.
   - **GeckoView Content Blocking**: Strict Enhanced Tracking Protection (ETP) and Total Cookie Protection.
   - **WebExtension (`android/app/src/main/assets/extensions/adblock`)**: Manifest V2 Firefox extension with background web request blocking and content scripts.
   - **DOM JavaScript Shield (`AdBlockEngine.ts`)**: Injects CSS cosmetic filters, suppresses overlay clickjacking, neutralizes `window.open` abuse, and skips YouTube video ads.

3. **Custom Native Download Engine (`UCDownloadManagerModule.kt`)**:
   - Multi-threaded Kotlin background download engine with HTTP byte-range resume (`Range: bytes={downloadedBytes}-`) via `RandomAccessFile`.
   - **Expired Link Renewal ("Update Link" 🔗)**: Swap out expired temporary download links (e.g. 403 Forbidden or 410 Gone) for a fresh URL while resuming seamlessly from the exact byte offset without losing any downloaded megabytes.
   - **Simultaneous Limit (1 to 6)**: Dynamic queue scheduling that honors the user's concurrency setting in browser settings.
   - **Real-Time Speed Meter**: Per-task transfer speed and aggregate download speed (`⚡ Total: X MB/s`) emitted live to the UI.
   - Saves files directly to the public `Downloads` directory, with options to open files or explore the folder.

---

## 📂 Project Structure

```
├── android/                                 # Native Android Gradle Project
│   ├── app/src/main/
│   │   ├── assets/extensions/adblock/       # Built-in Firefox WebExtension
│   │   └── java/com/iuc/browser/
│   │       ├── MainActivity.kt              # Main Activity
│   │       ├── MainApplication.kt           # Application Entry & Package Registration
│   │       ├── UCBrowserPackage.kt          # Native Package Registry
│   │       ├── adblock/
│   │       │   └── AdBlocker.java           # Native domain & regex interceptor
│   │       ├── download/
│   │       │   └── UCDownloadManagerModule.kt # OS DownloadManager integration
│   │       └── web/
│   │           ├── GeckoRuntimeManager.kt   # GeckoView Singleton Engine
│   │           ├── UCWebEngineManager.kt    # React Native ViewManager
│   │           └── UCWebEngineView.kt       # Native GeckoView wrapper & delegates
├── src/
│   ├── components/
│   │   ├── GeckoBrowserView.tsx             # React Native bridge component
│   │   └── SwipeableTabCard.tsx             # Interactive 2-column tab cards with swipe-up
│   ├── screens/
│   │   └── BrowserScreen.tsx                # Central browser UI, state, and modals
│   ├── services/
│   │   ├── AdBlockEngine.ts                 # In-page ad blocker & YouTube scripts
│   │   ├── DownloadManagerService.ts        # Download service bridge & formatters
│   │   ├── ReaderModeEngine.ts              # Readability extractor & HTML generator
│   │   └── StorageService.ts                # AsyncStorage credentials, history, and settings
│   └── types/
│       └── browser.ts                       # Core TypeScript interfaces
├── App.tsx                                  # Root Application Entry
├── package.json
└── README.md
```

---

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Android Studio & Android SDK](https://developer.android.com/studio) (API 24+)
- [JDK 17 or JDK 21](https://adoptium.net/)
- Physical Android device (recommended) or Android Emulator (ARM64 / x86_64)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Muqaddas12/iuc-browser.git
cd "iuc browser"
npm install
```

### 2. Verify TypeScript Types
```bash
npx tsc --noEmit --skipLibCheck
```

### 3. Start Expo Bundler
```bash
npx expo start
```

### 4. Build & Install Debug APK
```powershell
# From the android/ directory
cd android
.\gradlew.bat app:assembleDebug '-PreactNativeArchitectures=arm64-v8a,armeabi-v7a'

# Install directly to a connected device via adb
adb install -r app\build\outputs\apk\debug\app-debug.apk
```

---

## 📱 Supported Platforms

- **Android 7.0+ (API Level 24+)**
- Architectures: `arm64-v8a`, `armeabi-v7a`, `x86_64`

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
