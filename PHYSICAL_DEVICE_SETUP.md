# Physical Device Setup Guide

## ✅ Code Signing Fixed

I've enabled **Automatic Code Signing** for physical device builds. This allows you to install the app on your iPhone using a **free Apple ID** (no paid developer account needed).

## 📱 Next Steps

### 1. Add Your Apple ID to Xcode

1. Open **Xcode**
2. Go to **Xcode → Settings** (or **Preferences** on older versions)
3. Click the **Accounts** tab
4. Click the **+** button and select **Apple ID**
5. Sign in with your Apple ID (the same one you use for the App Store)

### 2. Select Your Team in Xcode

1. In Xcode, open the project: `ios/Usul.xcworkspace`
2. Select the **Usul** project in the navigator (top item)
3. Select the **Usul** target
4. Go to the **Signing & Capabilities** tab
5. Under **Signing**, check **"Automatically manage signing"**
6. Select your **Team** from the dropdown (should show your Apple ID name)
7. Xcode will automatically create a provisioning profile

### 3. Connect Your iPhone

1. Connect your iPhone to your Mac via USB
2. Unlock your iPhone and **trust the computer** if prompted
3. In Xcode, select your iPhone from the device dropdown (next to the scheme selector)

### 4. Build and Run

1. Click the **Play** button (▶️) or press **Cmd+R**
2. On your iPhone, go to **Settings → General → VPN & Device Management**
3. Trust the developer certificate (your Apple ID)
4. The app should install and run!

## 🔧 What Was Changed

- ✅ Enabled **Automatic Code Signing** (`CODE_SIGN_STYLE = Automatic`)
- ✅ Removed manual signing restrictions for device builds
- ✅ Kept simulator builds without signing (for faster simulator builds)
- ✅ Set proper entitlements file path

## ⚠️ Important Notes

- **Free Apple ID**: You can use a free Apple ID for development on your own devices
- **7-Day Limit**: Free accounts have a 7-day certificate expiration. After 7 days, you'll need to rebuild/reinstall
- **Device Limit**: Free accounts can install on a limited number of devices
- **App Store**: To distribute to others or publish to the App Store, you'll need a paid developer account ($99/year)

## 🐛 Troubleshooting

### "No signing certificate found"
- Make sure you've added your Apple ID in Xcode Settings → Accounts
- Make sure "Automatically manage signing" is checked in Signing & Capabilities

### "Provisioning profile not found"
- Xcode should create this automatically when you select your team
- Try: Product → Clean Build Folder, then rebuild

### "Untrusted Developer"
- On your iPhone: Settings → General → VPN & Device Management
- Tap your Apple ID under "Developer App"
- Tap "Trust [Your Apple ID]"

### Still having issues?
- Make sure your iPhone is unlocked
- Make sure you've trusted the computer on your iPhone
- Try disconnecting and reconnecting your iPhone
- Restart Xcode

## ✅ You're All Set!

The app should now install on your physical device. Just follow the steps above to add your Apple ID and select your team in Xcode.

