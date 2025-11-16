# Fix Xcode Indexing Issues

## Why Indexing Gets Stuck

Xcode indexing can pause or get stuck for several reasons:

1. **Large Project**: Many files and dependencies (like Pods) take time to index
2. **First Time Opening**: Xcode needs to build the index database from scratch
3. **Derived Data Issues**: Corrupted or incomplete derived data
4. **Memory Constraints**: Not enough RAM for large projects
5. **Background Processes**: Other processes competing for resources

## Quick Fixes

### Option 1: Resume Indexing (Easiest)
1. In Xcode, click the **"Indexing | Paused"** dropdown in the toolbar
2. Select **"Indexing | Initializing datastore"** to resume
3. Wait for indexing to complete (can take 5-15 minutes for large projects)

### Option 2: Clean Derived Data
```bash
# Close Xcode first, then run:
rm -rf ~/Library/Developer/Xcode/DerivedData/Usul-*
```

Then reopen Xcode - it will rebuild the index.

### Option 3: Restart Indexing
1. In Xcode: **Product → Clean Build Folder** (Shift+Cmd+K)
2. Close Xcode completely
3. Reopen the workspace
4. Wait for indexing to complete

### Option 4: Build Without Waiting for Indexing
You can build even while indexing is paused:
1. Select **iPhone 12 Pro Max** from device dropdown
2. **Product → Build** (Cmd+B)

Indexing will continue in the background, but you can still build.

## Current Status

Your project has:
- ✅ Workspace opened successfully
- ⏸️ Indexing paused (this is normal)
- ✅ Can still build while indexing

## Recommendation

**Just let it index!** For a React Native/Expo project with Pods, indexing can take 10-15 minutes the first time. You can:
- Let it run in the background
- Or resume it from the dropdown
- Build anyway - it will work even if indexing isn't complete

The indexing is for code completion and navigation features - the build will work regardless.

