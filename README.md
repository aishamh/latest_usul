# Usul Mobile App

Production-ready React Native (Expo) app with Firebase Auth/Firestore, Apple/Google sign-in, and a Release simulator workflow (no Metro link required).

## Prerequisites

- macOS with Xcode 15+ (Simulator iOS 18 OK)
- CocoaPods (via Homebrew) and UTF‑8 locale for pods:
  - `brew install cocoapods`
  - add to shell profile if needed: `export LANG=en_US.UTF-8`
- Node 18+ and npm
- GitHub CLI (optional) for repo ops: `brew install gh`

## Environment

Create `.env.local` at the project root (present in this repo). It contains:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...

# Google OAuth
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=... (optional for web)

EXPO_PUBLIC_USUL_API=https://api.usul.ai
```

## Firebase Console

Enable in Firebase → Authentication → Sign‑in method:
- Email/Password: Enabled
- Google: Enabled (iOS client ID configured)
- Apple: Enabled (if you have Apple Developer Service ID configured)

Firestore: no manual indexes required for the default flows.

## Run Options

### A) Release Simulator build (no Metro/dev server)
This produces a self-contained simulator app that does not depend on a link or Metro server.

1) Prebuild native iOS (from project root):
```bash
npx expo prebuild --platform ios --clean --no-install
```

2) Install pods with UTF‑8:
```bash
cd ios
LANG=en_US.UTF-8 pod install
cd ..
```

3) Build & run (Xcode UI)
- Open `ios/Usul.xcworkspace` in Xcode.
- Select a simulator (e.g., iPhone 16 Pro).
- Product → Clean Build Folder.
- In Signing & Capabilities, set Team; change bundle id if needed (e.g., `com.usul.ai.dev`).
- Scheme: `Usul`, Configuration: `Release`.
- Run (Cmd+R).

CLI alternative:
```bash
xcodebuild \
  -workspace ios/Usul.xcworkspace \
  -scheme Usul \
  -configuration Release \
  -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,name=iPhone 16 Pro' \
  -derivedDataPath ios/build \
  build
```

### B) Debug development (Metro) workflow

1) Start Metro:
```bash
npm start
```

2) Build & run in Debug:
```bash
expo run:ios
```
If you see “Could not connect to development server”, ensure Metro is running at `http://localhost:8081` and reload (Cmd+R).

### C) Expo Go (optional)
If you prefer Expo Go (no native build), run:
```bash
npm start
```
Open the project in Expo Go and enter the `exp://` URL from the terminal (simulator: localhost works; device: use LAN IP).

## Feature Flags

File: `src/config/features.ts`
```ts
export const FEATURES = {
  USE_FIREBASE: true,   // false = local-only mode
  USE_CLOUD_SYNC: true,
  USE_SOCIAL_AUTH: true
}
```

## Where Firebase is used

- Config: `src/lib/firebase.ts`
- Firestore helpers: `src/lib/firestoreChat.ts`
- Auth store: `src/store/authStore.ts`
- Login screen and flows: `src/app/login.tsx`

On email signup, a user is created in Firebase Auth and a profile doc is saved to `users/{uid}` in Firestore.

## Testing Signup

1) Launch the app (Release or Debug).
2) Tap “Sign up” → enter email/password → “Sign up with Email”.
3) Confirm in Firebase Console:
   - Authentication → Users
   - Firestore → `users` collection

## Troubleshooting

- CocoaPods encoding error:
  - Use `LANG=en_US.UTF-8 pod install`
- Could not connect to development server:
  - Ensure `npm start` is running and reload (Cmd+R). For Release builds this is not needed.
- GoogleService-Info.plist path:
  - We use `ios.googleServicesFile: "./GoogleService-Info.plist"` (root-level file copied into the app bundle).

## Scripts

- Start Metro: `npm start`
- Run iOS (debug): `npm run ios`
- Prebuild iOS: `npm run prebuild`

## License
Private repository (all rights reserved).

# Usul AI Mobile (Expo + React Native)

A lightweight mobile client for Usul AI built with Expo Router and React Native. It streams answers from the Usul API and renders markdown in a chat UI.

## Prerequisites

- macOS with Xcode and iOS Simulator
- Node.js 20+ (LTS recommended)
- npm (bundled with Node)
- CocoaPods: `sudo gem install cocoapods`

## 1) Install dependencies

```bash
npm install
```

## 2) Create a dev build (shows the app as “Usul”, not Expo Go)

The first run installs a custom dev client on the simulator so the app launches as “Usul” with the Usul icon/splash.

```bash
# Generate native iOS project files (one-time or when native config changes)
npx expo prebuild -p ios

# Install iOS pods
cd ios && pod install && cd ..

# Build and install the iOS dev client to the simulator
npx expo run:ios
```

After the first build you only need to run the dev server:

```bash
# Starts Metro and opens the Usul dev client
npm run dev:ios
```

If you prefer to run Metro without opening iOS immediately:

```bash
npm run dev
```

## 3) Ask questions

Open the app, go to Chat, and ask a question. Responses stream and render as markdown.

- Parser: `src/services/llm.ts` handles SSE/stream parsing and sanitization.
- Renderer: `react-native-markdown-display` in `src/app/chat_mobile.tsx`.

## API configuration

By default, the app calls the Usul public endpoint:

- `https://api.usul.ai/chat/multi?locale=en`

Optional: You can run a local proxy (for debugging or network constraints) using the included Node server and then point the app to it (requires changing the URL inside `src/services/llm.ts`).

```bash
# 1) Start local proxy on port 3001
API_PORT=3001 node api-server.js

# 2) Start Metro (the code currently targets the public endpoint.
#    To use the proxy, update the URL in src/services/llm.ts accordingly.)
npx expo start --dev-client
```

## Branding

- App name and icon are configured in `app.json` (name: `Usul`, icon: `assets/usul_icon.png`).
- iOS splash and display name are set via `ios/Usul/Info.plist` and the Expo config.

## Troubleshooting

- Metro cache issues: stop Metro, then run with `--clear`.
- iOS pods: if build fails, run `cd ios && pod install --repo-update`.
- Simulator cannot open the URL: ensure Metro reports `packager-status:running` on `http://localhost:8083/status`.
- If you see raw JSON/status frames inside the chat bubbles, make sure you’re on the latest `src/services/llm.ts` (it filters non-answer events and normalizes text).

## Notes

- This client mirrors the Usul site’s streaming style. Exact answers depend on the upstream service quality/availability.
- For a fully self-hosted backend matching usul.ai, set up their API with Postgres/Redis/Azure Search/OpenAI as documented in their repository and then change the client endpoint in `src/services/llm.ts`.

