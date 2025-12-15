# Android Bridge Testing Guide

## Quick Start

### Step 1: Rebuild Android App
Open Android Studio and:
1. **Build** → **Clean Project**
2. **Build** → **Build Bundle(s)/APK(s)** → **Build APK(s)**
3. **Run** 'app' (or press Shift+F10)

Wait for the app to compile and install on your device/emulator.

### Step 2: Check Console on App Load
**In Android Studio Logcat**, filter by "ChatApp":
- Look for the Toast message: `"JavaScript interface 'AndroidNotification' added"`
- If you see this, the Java side is working correctly

### Step 3: Open Bridge Test Page
1. When the web app loads in the app, you'll see a new **"Bridge Test"** button in the header
2. Click it to open the diagnostic page
3. You should see the status: **"✅ Android Bridge is AVAILABLE"**

### Step 4: Run Diagnostics
On the bridge test page, click the buttons in order:

1. **"Test Bridge"** - Shows:
   - ✅ window.AndroidNotification EXISTS
   - ✅ showNotification() is a FUNCTION
   - ✅ test() is a FUNCTION
   - All in green success boxes

2. **"Test Bridge Method"** - Calls the test() method and shows:
   - ✅ Returns: "Android bridge is working! This is from NotificationBridge.test()"

3. **"Show Notification"** - Should trigger a native Android notification:
   - Look in your system notification tray
   - Title: "Test Notification"
   - Message: "This is a test message from the web page"
   - Should have sound + vibration

### Step 5: Test Real Messages
1. Open the app on your device
2. From another user (or different browser), send a message
3. The receiving app should:
   - Show the message in chat
   - Display an Android notification in the system tray
   - Console should show: `"=== NOTIFICATION TRIGGERED ==="`

## Console Output to Expect

### On Page Load
```
=== NotificationHandler Module Loaded ===
Is Android app (has window.AndroidNotification): true
window.AndroidNotification: [object Object]
=== End NotificationHandler Diagnostics ===

=== ANDROID BRIDGE TEST ===
window.AndroidNotification exists: true
window.AndroidNotification value: [object Object]
✅ Android bridge is AVAILABLE
Methods: [showNotification, test]
=== END BRIDGE TEST ===
```

### On New Message
```
=== NOTIFICATION TRIGGERED ===
Sending notification: Message from [name], [preview], [sender]
Android bridge available, sending notification...
Android notification sent successfully
```

## Troubleshooting

### If Bridge Shows as NOT Available
**Symptoms**: "❌ Android bridge is NOT available" or "window.AndroidNotification is UNDEFINED"

**Check List**:
1. ✅ Did you rebuild the app? (Clean + Build)
2. ✅ Did you see the Toast message in Android Studio Logcat?
3. ✅ Is the NotificationBridge.java file present? (Check file explorer in Android Studio)
4. ✅ Does NotificationBridge.java have the @JavascriptInterface annotation?

**If Toast message appeared but bridge is still undefined**:
- Hard refresh the web page in the app (Chrome dev tools → empty cache & hard refresh if available)
- Or: Clear app cache in Android Settings → Apps → ChatApp → Storage → Clear Cache
- Then restart the app

### If Test Notification Doesn't Appear
1. Check notification permissions in Android Settings
2. Check that notifications are not muted (volume controls)
3. Check NotificationCompat is imported correctly in NotificationBridge.java
4. Check NotificationManager is properly initialized in MainActivity.java

### If showNotification() Throws Error
- Check Android Logcat for the actual error message
- Verify CHANNEL_ID is defined correctly
- Verify notificationManager is passed correctly to NotificationBridge constructor

## File Locations

**Android Side**:
- `android-app/app/src/main/java/com/example/chatapp/NotificationBridge.java` - The interface class
- `android-app/app/src/main/java/com/example/chatapp/MainActivity.java` - Where bridge is registered

**Web Side**:
- `pages/chat.js` - Bridge diagnostic logs on page load
- `lib/notificationHandler.js` - Notification handler with bridge detection
- `public/bridge-test.html` - Comprehensive test page

**Documentation**:
- `BRIDGE_FIX_LOG.md` - Detailed explanation of the fix
- This file - Quick reference guide

## Key Concepts

**Why did we extract NotificationBridge to a separate file?**
- Inner classes have visibility/scope limitations in Android WebView JavaScript bridge
- Top-level public classes are more reliably exposed to JavaScript
- The @JavascriptInterface annotation explicitly marks methods as accessible

**Why does the bridge test page exist?**
- Separates bridge testing from actual chat functionality
- Provides isolated environment to debug JavaScript bridge issues
- Includes method call testing (test()) without side effects

**Why do we have console logs on both web and Android?**
- Web logs show if JavaScript can access the bridge
- Android logs (Logcat) show if Java side is working
- Together, they help identify if the problem is client-side or Android-side

## Next Steps (After Successful Testing)

1. ✅ Verify bridge is accessible (steps above)
2. ✅ Verify notifications appear on Android
3. Test across different message scenarios:
   - Text only
   - Images
   - Replies to messages
4. Monitor notification delivery times
5. Test notification click behavior
6. Consider adding:
   - Notification dismissal handling
   - Badge counts
   - Sound/vibration options
   - Notification groups (multiple messages)

## Success Criteria

You know the fix is working when:
- [ ] Bridge test page shows ✅ "Android Bridge is AVAILABLE"
- [ ] Bridge test page shows ✅ for showNotification() and test() methods
- [ ] "Test Bridge Method" button returns the test message
- [ ] "Show Notification" button creates an Android notification
- [ ] Real messages from other user trigger notifications in system tray
- [ ] Android Logcat shows "JavaScript interface 'AndroidNotification' added" on app load
