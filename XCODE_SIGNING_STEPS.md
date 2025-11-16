# Step-by-Step: Setting Up Code Signing in Xcode

## ✅ You're Already Logged In!

Great! I can see you're logged in with `aisha.halane@hotmail.com` and have a **Personal Team** set up. Now let's configure the project signing.

## 📋 Step-by-Step Instructions

### Step 1: Open the Workspace (NOT the .xcodeproj)

1. **Close Xcode** if it's open
2. Open **Finder**
3. Navigate to: `/Users/aishahalane/Downloads/usul-app-2/ios/`
4. **Double-click** `Usul.xcworkspace` (the blue icon with a white document)
   - ⚠️ **Important**: Open the `.xcworkspace` file, NOT the `.xcodeproj` file!

### Step 2: Select the Project

1. In Xcode, look at the **left sidebar** (Project Navigator)
2. You'll see a **blue icon** at the very top labeled **"Usul"**
3. **Click once** on that blue "Usul" icon (this is the project)

### Step 3: Select the Target

1. In the **main editor area** (center), you'll see project settings
2. Look for a list of **targets** - you should see **"Usul"** listed
3. **Click once** on **"Usul"** under the TARGETS section
   - It should highlight in blue

### Step 4: Open Signing & Capabilities

1. At the **top of the editor area**, you'll see tabs like:
   - General
   - Signing & Capabilities ← **Click this one!**
   - Build Settings
   - Build Phases
   - etc.
2. **Click on "Signing & Capabilities"**

### Step 5: Enable Automatic Signing

1. In the **Signing & Capabilities** tab, you'll see a section called **"Signing"**
2. Look for a checkbox that says **"Automatically manage signing"**
3. **Check the box** ☑️

### Step 6: Select Your Team

1. Right below "Automatically manage signing", you'll see a dropdown labeled **"Team"**
2. **Click the dropdown**
3. You should see: **"Aisha Mahad Halane (Personal Team)"**
4. **Select it**

### Step 7: Wait for Xcode to Configure

1. Xcode will automatically:
   - Create a provisioning profile
   - Set up the bundle identifier
   - Configure signing certificates
2. You might see a brief loading indicator
3. Once done, you should see a **green checkmark** ✅ next to "Signing"

## 🎯 Visual Guide

```
Xcode Window Layout:
┌─────────────────────────────────────────┐
│  [File] [Edit] [View] ...               │
├──────────┬──────────────────────────────┤
│          │  [General] [Signing &        │
│  Usul    │   Capabilities] [Build...]   │
│  (blue)  │                              │
│          │  Signing                     │
│  └─ Usul │  ☑ Automatically manage      │
│  (target)│     signing                  │
│          │  Team: [Aisha Mahad Halane   │
│          │         (Personal Team) ▼]   │
│          │  ✅ Signing is valid         │
└──────────┴──────────────────────────────┘
```

## ✅ Success Indicators

You'll know it worked when you see:
- ✅ **Green checkmark** next to "Signing"
- ✅ **Bundle Identifier** shows: `com.usul.ai`
- ✅ **Provisioning Profile** shows: "Xcode Managed Profile"
- ✅ **No red error messages**

## 🐛 Troubleshooting

### "No accounts with a valid signing certificate"
- Make sure you're logged in (you are! ✅)
- Try: Xcode → Settings → Accounts → Select your account → Click "Download Manual Profiles"

### "Provisioning profile creation failed"
- Make sure "Automatically manage signing" is checked
- Try unchecking and rechecking it
- Close and reopen Xcode

### Can't find "Signing & Capabilities" tab
- Make sure you selected the **Usul target** (not just the project)
- Look at the top of the editor - the tabs should be visible

### Still seeing errors?
- Try: **Product → Clean Build Folder** (Shift+Cmd+K)
- Then try building again

## 🚀 Next: Build and Run!

Once signing is set up:
1. Connect your iPhone via USB
2. Unlock your iPhone
3. Select your iPhone from the device dropdown (top toolbar, next to the Play button)
4. Click the **Play button** (▶️) or press **Cmd+R**

The app should build and install on your device!

