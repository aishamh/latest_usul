# Fix the Code Signing Identity in Xcode Build Settings

The error is coming from Xcode's Build Settings UI, not the project file. Here's how to fix it:

## 🔧 **Step-by-Step Fix**

### **Step 1: Open Build Settings**
1. In Xcode, click the **blue "Usul"** project icon in the left sidebar
2. Click **"Usul"** under **TARGETS**
3. Click the **"Build Settings"** tab (you might already be there)

### **Step 2: Find Code Signing Identity**
1. In the search bar at the top of Build Settings, type: **"code signing identity"**
2. Look for **"Code Signing Identity"** in the results
3. You should see it under the **"Signing"** section

### **Step 3: Fix the Setting**
1. Click on **"Code Signing Identity"** to expand it
2. You'll see two rows:
   - **Debug**
   - **Release**
3. For **BOTH** Debug and Release:
   - Click on the value (it might say the specific certificate name)
   - Change it to: **"Apple Development"** (the generic one, not the specific email)
   - Or set it to: **"$(CODE_SIGN_IDENTITY)"** to use automatic

### **Step 4: Also Check "Any iOS SDK"**
1. Under "Code Signing Identity", look for **"Any iOS SDK"**
2. Make sure it's set to **"Apple Development"** (not the specific certificate)

### **Step 5: Clean and Rebuild**
1. **Product → Clean Build Folder** (Shift+Cmd+K)
2. Close Xcode completely
3. Reopen the workspace
4. Try building again

## 🎯 **Visual Guide**

```
Build Settings → Search "code signing identity"
┌─────────────────────────────────────────┐
│ Code Signing Identity                   │
│   Debug: [Apple Development] ← Change!  │
│   Release: [Apple Development] ← Change!│
│   Any iOS SDK: [Apple Development]      │
└─────────────────────────────────────────┘
```

## ⚠️ **Alternative: Use Signing & Capabilities**

If Build Settings doesn't work, try this:

1. Go to **"Signing & Capabilities"** tab
2. **Uncheck** "Automatically manage signing"
3. **Check** it again
4. Select your team from the dropdown
5. This should reset all signing settings

## ✅ **What Should Happen**

After fixing this:
- The error should disappear
- You should see a green checkmark in Signing & Capabilities
- The build should succeed

