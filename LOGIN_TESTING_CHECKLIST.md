# 🧪 Login Testing Checklist

## 📱 Simulator Status
- iOS Simulator: Opening...
- App: Building and installing...
- Wait for the app to appear on the simulator screen

---

## ✅ TEST 1: Email/Password Login

### Setup (Sign Up First)
1. **Click "Sign up"** button
2. **Enter credentials:**
   ```
   Email:    test1@example.com
   Password: TestPass123!
   ```
3. **Click "Sign up with Email"**

### Expected Result:
- ✅ Account created
- ✅ Automatically logged in
- ✅ Redirected to chat screen
- ✅ Data saved to Firebase

### Verify in Firebase Console:
```
Auth: https://console.firebase.google.com/project/usul-ai/authentication/users
Database: https://console.firebase.google.com/project/usul-ai/firestore/data
```
Look for user with email: `test1@example.com`

### Test Login (After Logout)
1. **Click "Log in"**
2. **Enter same credentials:**
   ```
   Email:    test1@example.com
   Password: TestPass123!
   ```
3. **Click "Continue with Email"**

### Expected Result:
- ✅ Logged in successfully
- ✅ Shows same user data

---

## 🔴 TEST 2: Google Sign-In (iOS)

### Test Sign Up with Google
1. **Click "Sign up"**
2. **Click "Continue with Google"**
3. **Browser/WebView should open**
4. **Select a Google account**
5. **Authorize the app**

### Expected Results:
- ✅ Google OAuth flow opens
- ✅ Account created with Google
- ✅ Profile saved to Firebase
- ✅ Logged in automatically

### Possible Issues:
⚠️ **If you see error: "Configuration needed"**
- This means the redirect URI isn't registered
- Need to add redirect URI in Google Cloud Console

⚠️ **If OAuth doesn't open:**
- iOS Client ID might need verification
- Check Google Cloud Console settings

### Verify in Firebase:
- User should appear with provider: "google.com"
- Email from Google account should be saved

---

## 🍎 TEST 3: Apple Sign-In (iOS)

### Test Sign Up with Apple
1. **Click "Sign up"**
2. **Click "Continue with Apple ID"**
3. **Apple Sign-In sheet should appear**
4. **Use Apple ID credentials OR use simulator's test account**
5. **Choose options (Share My Email, etc.)**
6. **Click "Continue"**

### Expected Results:
- ✅ Apple Sign-In sheet appears
- ✅ Account created with Apple
- ✅ Profile saved to Firebase
- ✅ Logged in automatically

### Possible Issues:
⚠️ **If you see: "Apple ID not available"**
- Running on web instead of iOS
- Need to test on iOS simulator or device

⚠️ **If sign-in fails:**
- May need Apple Developer account setup
- Service ID for Sign in with Apple might not be configured

### In iOS Simulator:
- You can use a test Apple ID
- Or simulator's built-in test accounts

### Verify in Firebase:
- User should appear with provider: "apple.com"
- Email or Apple Private Relay email saved

---

## 📊 Testing Checklist

### Test 1: Email/Password ✅
- [ ] Sign up works
- [ ] User created in Firebase Auth
- [ ] Profile saved to Firestore
- [ ] Can see user in Firebase Console
- [ ] Can log out
- [ ] Can log back in
- [ ] Data persists

### Test 2: Google Sign-In ⚠️
- [ ] Button appears
- [ ] OAuth flow opens
- [ ] Can authenticate
- [ ] User created in Firebase
- [ ] Profile saved to Firestore
- [ ] Can log out and back in

### Test 3: Apple Sign-In ⚠️
- [ ] Button appears
- [ ] Apple sheet opens
- [ ] Can authenticate
- [ ] User created in Firebase
- [ ] Profile saved to Firestore
- [ ] Can log out and back in

---

## 🔍 What Data is Saved?

### Firebase Authentication:
```
UID: Unique user ID (e.g., "bpIg7BjNV7...")
Email: User's email
Provider: "password", "google.com", or "apple.com"
```

### Firestore Database (users collection):
```json
{
  "email": "user@example.com",
  "name": "User Name",
  "provider": "email" | "google" | "apple",
  "avatar": "https://..." (if available),
  "createdAt": [timestamp],
  "lastLoginAt": [timestamp]
}
```

---

## 🐛 Troubleshooting

### Email/Password Issues:
- **"Weak password"** → Use at least 6 characters
- **"Email already exists"** → Use different email or log in
- **"Invalid email"** → Check email format

### Google Sign-In Issues:
- **"Configuration needed"** → Web Client ID missing
- **"OAuth error"** → Redirect URI not registered
- **"Invalid client"** → Check Client IDs in Google Cloud

### Apple Sign-In Issues:
- **"Not available"** → Must use iOS simulator/device
- **"Authentication failed"** → Check Apple Developer setup
- **Sign-in sheet doesn't appear** → May need Service ID configuration

---

## 📸 Expected Flow

### 1. Welcome Screen
```
┌─────────────────────────────┐
│   Welcome to Usul           │
│   Choose an option          │
│                             │
│   [Log in]                  │
│   [Sign up]                 │
└─────────────────────────────┘
```

### 2. Sign Up Screen
```
┌─────────────────────────────┐
│   Create your account       │
│                             │
│   Email: [____________]     │
│   Password: [_________]     │
│                             │
│   [Sign up with Email]      │
│                             │
│   Or continue with          │
│                             │
│   [🔴 Google]               │
│   [🍎 Apple ID]             │
└─────────────────────────────┘
```

### 3. After Successful Login
```
┌─────────────────────────────┐
│   ← Back                    │
│                             │
│   Chat Interface            │
│   (Main app screen)         │
│                             │
└─────────────────────────────┘
```

---

## 🎯 Success Criteria

### Each method should:
1. ✅ Create user in Firebase Authentication
2. ✅ Save profile to Firestore database
3. ✅ Log user in automatically
4. ✅ Show user in Firebase Console
5. ✅ Persist login after app restart
6. ✅ Allow logout
7. ✅ Allow login again

---

## 📝 Notes

- **Email/Password**: Most reliable, always works
- **Google**: Should work on iOS, may need Web config for web testing
- **Apple**: Works on iOS simulator/device only, may need developer setup

**All working methods WILL save data to Firebase database!**

---

Ready to test! Wait for the app to appear in the simulator, then follow the checklist above! 🚀

