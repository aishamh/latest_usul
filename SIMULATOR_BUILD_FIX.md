# Fix Signing Errors for Simulator Builds

## ✅ What I Fixed

1. **Disabled Code Signing for Simulator**: Set `CODE_SIGN_IDENTITY[sdk=iphonesimulator*] = ""`
2. **Removed Team Requirement**: Set `DEVELOPMENT_TEAM = ""` and `DEVELOPMENT_TEAM[sdk=iphonesimulator*] = ""`
3. **Set Manual Signing Style**: Changed to `CODE_SIGN_STYLE = Manual`
4. **Removed Entitlements**: Set `CODE_SIGN_ENTITLEMENTS = ""` for simulator builds

## 🎯 What to Do in Xcode

The errors you're seeing are because Xcode is trying to use automatic signing. Here's how to fix it:

### Option 1: Disable Signing in Xcode UI (Easiest)

1. **Select the Usul target** (left sidebar)
2. **Go to "Signing & Capabilities" tab**
3. **Uncheck "Automatically manage signing"**
4. **For "Signing Certificate"**: Select **"None"** or leave it empty
5. **For "Provisioning Profile"**: Select **"None"** or leave it empty

This will disable signing completely for simulator builds, which is perfectly fine!

### Option 2: Change Bundle Identifier (If Option 1 doesn't work)

If you still see errors, change the bundle identifier to something unique:
1. In **Signing & Capabilities**
2. Change **Bundle Identifier** from `com.usul.ai` to `com.usul.ai.dev` or `com.yourname.usul`

## 📱 Important Notes

- **Simulator builds DON'T need signing** - this is normal and expected
- **No Apple Developer account needed** for simulator builds
- **No provisioning profiles needed** for simulator builds
- The errors are just warnings - the build will work

## ✅ After Making Changes

1. **Clean Build Folder**: Product → Clean Build Folder (Shift+Cmd+K)
2. **Build**: Product → Build (Cmd+B)
3. **Run**: Product → Run (Cmd+R)

The project is now configured to build without signing for simulator. The errors should disappear once you disable automatic signing in Xcode's UI.

