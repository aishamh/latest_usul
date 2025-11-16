# Testing the App on Your iPhone

## 🚫 **No, Don't Use Expo Go!**

Since your app uses **native modules** (like `expo-apple-authentication`, `expo-router`, etc.), it **cannot run in Expo Go**. You need to build and install it directly on your device.

## ✅ **Method 1: Build & Run from Xcode (Recommended)**

This is the method we've already set up for you!

### Steps:

1. **Connect Your iPhone**
   - Connect your iPhone to your Mac via USB cable
   - Unlock your iPhone
   - If prompted, tap "Trust This Computer" on your iPhone

2. **Open Xcode**
   - Open `ios/Usul.xcworkspace` in Xcode
   - Wait for indexing to complete (if it's still running)

3. **Select Your Device**
   - At the top of Xcode, next to the Play button, click the device selector
   - You should see your iPhone listed (e.g., "Aisha's iPhone")
   - Select it

4. **Build and Run**
   - Click the **Play button** (▶️) or press **Cmd+R**
   - Xcode will:
     - Build the app
     - Install it on your iPhone
     - Launch it automatically

5. **Trust the Developer (First Time Only)**
   - On your iPhone, you might see: "Untrusted Developer"
   - Go to: **Settings → General → VPN & Device Management**
   - Tap your Apple ID under "Developer App"
   - Tap **"Trust [Your Apple ID]"**
   - Go back to the app and it should launch!

### Running the Development Server

After the app installs, you need to start the Expo development server:

1. **In Terminal**, run:
   ```bash
   cd /Users/aishahalane/Downloads/usul-app-2
   npm start
   # or
   expo start
   ```

2. **In the app on your phone**, it should automatically connect to the development server
   - The app will reload when you make code changes
   - You'll see a QR code in the terminal (for reference)

## ✅ **Method 2: Using Expo CLI (Alternative)**

If you prefer using the command line:

```bash
cd /Users/aishahalane/Downloads/usul-app-2
npx expo run:ios --device
```

This will:
- Build the app
- Install it on your connected iPhone
- Start the development server automatically

## 🔄 **Development Workflow**

Once the app is installed:

1. **Keep the development server running** (Terminal with `npm start`)
2. **Make code changes** in your editor
3. **The app will reload automatically** on your phone (Hot Reload)
4. **Or shake your phone** to open the developer menu

## 📱 **What You'll See**

- The app will install on your iPhone's home screen
- It will have the Usul icon
- When you open it, it connects to your development server
- You can use it like a normal app!

## ⚠️ **Important Notes**

### Free Apple ID Limitations:
- **7-Day Expiration**: The app will stop working after 7 days
- **Solution**: Just rebuild and reinstall (takes 2 minutes)
- **Device Limit**: You can install on a limited number of devices

### Network Requirements:
- Your iPhone and Mac need to be on the **same Wi-Fi network**
- Or use USB connection (which we've set up)

### If the App Doesn't Connect:
1. Make sure the development server is running (`npm start`)
2. Check that both devices are on the same Wi-Fi
3. Try shaking your phone to open the developer menu
4. Check the terminal for connection errors

## 🎯 **Quick Start Commands**

```bash
# Start development server
npm start

# Build and install on device (in another terminal)
npx expo run:ios --device
```

## ✅ **You're All Set!**

The app should now work on your iPhone. Just:
1. Build from Xcode (or use `expo run:ios --device`)
2. Start the development server (`npm start`)
3. Use your app!

The app will automatically reload when you make changes to your code.

