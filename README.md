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

