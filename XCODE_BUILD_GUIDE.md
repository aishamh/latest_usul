# Xcode Build Guide for Usul App

## ✅ Pre-build Checklist

### 1. Prerequisites
- ✅ Node.js installed (v23.10.0)
- ✅ CocoaPods installed
- ✅ Xcode 15+ installed
- ✅ iOS Simulator available

### 2. Configuration Complete
- ✅ **Simulator**: iPhone 12 Pro Max (iPhone13,4)
- ✅ **Swift Version**: 5.9 (matches Podfile)
- ✅ **iOS Deployment Target**: 16.0
- ✅ **Bundle Identifier**: com.usul.ai
- ✅ **Team ID**: ZXGH9DVWZF (configured)
- ✅ **Apple Sign In**: Enabled in entitlements
- ✅ **Google Services**: Configured

### 3. Build Steps

#### Option A: Build from Xcode (Recommended)
1. Open `ios/Usul.xcworkspace` in Xcode (NOT the .xcodeproj file)
2. Select **iPhone 12 Pro Max** from the device dropdown
3. Select your **Development Team** in Signing & Capabilities
4. Product → Clean Build Folder (Shift+Cmd+K)
5. Product → Build (Cmd+B) or Run (Cmd+R)

#### Option B: Build from Command Line
```bash
cd ios
xcodebuild -workspace Usul.xcworkspace \
  -scheme Usul \
  -configuration Debug \
  -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,name=iPhone 12 Pro Max' \
  clean build
```

#### Option C: Use Expo CLI
```bash
npx expo run:ios --device "iPhone 12 Pro Max"
```

### 4. Common Issues & Solutions

#### Issue: "Command PhaseScriptExecution failed"
- ✅ Fixed: Updated `.xcode.env.local` with correct Node path
- ✅ Fixed: Updated `.xcode.env` with fallback paths

#### Issue: Swift Version Mismatch
- ✅ Fixed: Updated project.pbxproj to use Swift 5.9

#### Issue: Missing Team ID
- ✅ Fixed: Configured Team ID in app.json

#### Issue: Apple Sign In Not Working
- ✅ Fixed: Added Apple Sign In capability to entitlements
- ✅ Fixed: Configured expo-apple-authentication plugin

### 5. Signing Configuration

In Xcode:
1. Select the **Usul** target
2. Go to **Signing & Capabilities** tab
3. Select your **Team** (should show your Apple ID)
4. Ensure **Bundle Identifier** is: `com.usul.ai`
5. Xcode will automatically manage provisioning profiles

### 6. Environment Variables

Make sure you have a `.env.local` file with:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=...
EXPO_PUBLIC_USUL_API=https://api.usul.ai
```

### 7. First Build Tips

1. **Clean Build Folder**: Always clean before first build (Shift+Cmd+K)
2. **Wait for Indexing**: Let Xcode finish indexing before building
3. **Check Pods**: Ensure all pods are installed (`pod install` completed)
4. **Simulator**: Make sure iPhone 12 Pro Max simulator is available

### 8. Build Configurations

- **Debug**: For development (includes debugging symbols)
- **Release**: For production (optimized, no debugging)

### 9. Troubleshooting

If build fails:
1. Check Xcode build log for specific errors
2. Verify all pods are installed: `cd ios && pod install`
3. Clean derived data: `rm -rf ~/Library/Developer/Xcode/DerivedData`
4. Rebuild: `npx expo prebuild --clean`

## ✅ All Set!

Your app is now configured to build on Xcode with iPhone 12 Pro Max simulator.

