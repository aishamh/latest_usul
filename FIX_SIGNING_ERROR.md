# Fixing Signing Errors

## 🔧 **Quick Fix: Select Team in Xcode**

The build is failing because Xcode can't automatically detect your team. Here's how to fix it:

### **Step 1: Open Xcode**
1. Open `ios/Usul.xcworkspace` in Xcode

### **Step 2: Select Project and Target**
1. Click the **blue "Usul"** icon in the left sidebar (the project)
2. Click **"Usul"** under **TARGETS** in the main area

### **Step 3: Go to Signing & Capabilities**
1. Click the **"Signing & Capabilities"** tab at the top

### **Step 4: Configure Signing**
1. **Check** ☑️ **"Automatically manage signing"**
2. In the **"Team"** dropdown, select:
   - **"Aisha Mahad Halane (Personal Team)"**
   - Or **"aisha.halane@hotmail.com (Personal Team)"**

### **Step 5: Wait for Xcode**
- Xcode will automatically:
  - Create a provisioning profile
  - Set up signing certificates
  - Show a green checkmark ✅ when done

### **Step 6: Build Again**
- Click the **Play button** (▶️) or press **Cmd+R**

## ✅ **What I Changed**

I removed the hardcoded team ID from the project file. This allows Xcode to:
- Automatically detect your team
- Let you select it from the dropdown
- Create provisioning profiles automatically

## 🐛 **If It Still Doesn't Work**

### **Option 1: Refresh Your Account**
1. In Xcode: **Xcode → Settings → Accounts**
2. Select your account (`aisha.halane@hotmail.com`)
3. Click **"Download Manual Profiles"**
4. Go back to Signing & Capabilities and try again

### **Option 2: Clean and Rebuild**
1. In Xcode: **Product → Clean Build Folder** (Shift+Cmd+K)
2. Close Xcode
3. Reopen the workspace
4. Try building again

### **Option 3: Remove and Re-add Account**
1. In Xcode: **Xcode → Settings → Accounts**
2. Select your account
3. Click the **"-"** button to remove it
4. Click **"+"** to add it back
5. Sign in again
6. Go back to Signing & Capabilities and select your team

## 📱 **After Signing Works**

Once you see the green checkmark:
1. Connect your iPhone
2. Select your iPhone as the build destination
3. Build and run (▶️)
4. The app will install on your phone!

## ⚠️ **Important**

- Make sure you're logged into Xcode with your Apple ID
- The team should show as "Personal Team" (free account)
- Xcode needs internet access to create provisioning profiles

