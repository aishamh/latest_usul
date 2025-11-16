# Authentication Testing Guide

## Test Results Summary ✅

### 1. Firebase Database Test
- **Status:** ✅ PASSED
- **Connection:** Working
- **Write/Read/Delete:** All successful
- **Cloud sync:** Available

### 2. Local-Only Mode Test
- **Status:** ✅ PASSED
- **Local storage:** Working
- **No Firebase required:** Confirmed
- **Data privacy:** Data stays on device

---

## How to Switch Between Modes

### Configuration File
Edit: `src/config/features.ts`

```typescript
export const FEATURES = {
  USE_FIREBASE: false,  // Change this value
  USE_CLOUD_SYNC: false,
  USE_SOCIAL_AUTH: false,
};
```

### Mode Options

#### Option 1: Local-Only Mode (Current Setting)
```typescript
USE_FIREBASE: false
```
- ✅ No Firebase required
- ✅ Data stays on device
- ✅ Works offline
- ❌ No cross-device sync
- ❌ No cloud backup
- ❌ No Google/Apple sign-in

**Perfect for:** Privacy, offline use, testing without Firebase

#### Option 2: Firebase Mode (Cloud Sync)
```typescript
USE_FIREBASE: true
```
- ✅ Cloud storage
- ✅ Cross-device sync
- ✅ Automatic backups
- ✅ Google/Apple sign-in
- ⚠️ Requires Firebase setup
- ⚠️ Internet connection needed

**Perfect for:** Production, multi-device users, social auth

---

## Testing User Creation

### Current Mode: Local-Only
The app is currently running in **local-only mode**.

### To Test:
1. Open the app on the simulator
2. Click "Sign up"
3. Enter:
   - Email: `test@example.com`
   - Password: `password123`
4. Click "Sign up with Email"

### Expected Result:
- ✅ Account created successfully
- ✅ Alert: "Account created successfully! (Local mode - no cloud sync)"
- ✅ User logged in
- ✅ Data stored locally (no Firebase)

### To Verify Local Storage:
```javascript
// Users are stored in AsyncStorage with key: 'usul_local_users'
// Current user stored with key: 'usul_current_user'
```

---

## Files Modified

1. **`src/config/features.ts`** - Feature flags
2. **`src/lib/localAuth.ts`** - Local authentication (NEW)
3. **`src/app/login.tsx`** - Updated login screen with both modes

---

## Important Notes

### Security Warning
⚠️ **Current implementation stores passwords in plain text for testing.**

For production, you MUST:
- Hash passwords using bcrypt or similar
- Use secure key derivation functions
- Never store plain text passwords

### Data Persistence

**Local Mode:**
- Data stored in AsyncStorage
- Survives app restarts
- Lost if app is uninstalled
- Cannot be synced across devices

**Firebase Mode:**
- Data stored in Firestore
- Survives device changes
- Can be accessed from multiple devices
- Automatic cloud backups

---

## Troubleshooting

### If login fails in local mode:
1. Check that `USE_FIREBASE: false` in `src/config/features.ts`
2. Clear app data and try again
3. Check console for error messages

### If you want to switch to Firebase mode:
1. Set `USE_FIREBASE: true` in `src/config/features.ts`
2. Ensure `.env.local` has correct Firebase credentials
3. Restart the app

---

## Next Steps

- [ ] Test user creation in local mode
- [ ] Test login with created user
- [ ] Test logout
- [ ] Switch to Firebase mode and test
- [ ] Add password hashing for production
- [ ] Test social auth (Google/Apple) with Firebase mode

