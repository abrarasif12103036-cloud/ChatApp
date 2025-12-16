# 🔧 Firebase Notifications - Troubleshooting Guide

## Common Issues & Solutions

---

## 1. 🔴 "Permission prompt not showing"

### Symptoms
- Browser doesn't ask for notification permission
- Can't enable notifications

### Causes & Solutions

**Cause 1: Permission already set**
```
Solution:
1. Check browser address bar → Notifications icon
2. Click and change to "Allow"
3. If shows "Block", click "Clear" or "Reset"
4. Reload page
5. Permission prompt should appear
```

**Cause 2: Incognito/Private mode**
```
Solution:
1. Most browsers block notifications in incognito
2. Try regular window instead
3. Or allow notifications first in regular window
```

**Cause 3: Browser doesn't support notifications**
```
Solution:
1. Use Chrome, Firefox, Safari, or Edge
2. Check browser is up to date
3. Notifications API not supported in very old browsers
```

**Cause 4: HTTPS not available**
```
Solution (for production):
1. Notifications require HTTPS
2. Localhost (http://localhost:3000) works in dev
3. When deploying to Vercel, uses HTTPS automatically
4. Self-signed certificates may not work
```

---

## 2. 🔴 "FCM Token is null"

### Symptoms
- Console shows: "FCM Token: null"
- `requestPermissionAndGetToken()` returns null

### Causes & Solutions

**Cause 1: VAPID Key is wrong or missing**
```
Solution:
1. Check .env.local has: NEXT_PUBLIC_FIREBASE_VAPID_KEY
2. Go to Firebase Console
   → Project Settings
   → Cloud Messaging tab
   → Copy exact VAPID Key
3. Paste into .env.local
4. Restart dev server: npm run dev
5. Try again
```

**Cause 2: Firebase Cloud Messaging not enabled**
```
Solution:
1. Go to Firebase Console
2. Click "Messaging" in sidebar
3. If you see "Enable Firebase Cloud Messaging"
   → Click it to enable
4. Wait 1 minute
5. Restart dev server
6. Try again
```

**Cause 3: User denied notification permission**
```
Solution:
1. Browser blocked notifications
2. Fix in browser settings:
   Chrome:
   ├─ Address bar → Notifications icon (🔔)
   ├─ Change to "Allow"
   └─ Reload page
   
   Firefox:
   ├─ Settings → Privacy & Security
   ├─ Permissions → Notifications
   ├─ Remove localhost:3000
   └─ Reload page (will ask again)
```

**Cause 4: Service Worker not registered**
```
Solution:
1. Check browser console
2. Look for "Service Worker registered" message
3. If not there, check _app.js has service worker code
4. Check /firebase-messaging-sw.js file exists
5. Restart dev server
```

---

## 3. 🔴 "Notifications not appearing in browser"

### Symptoms
- Permission granted
- Token works
- But no notifications show

### Causes & Solutions

**Cause 1: Notifications disabled in OS**
```
Windows:
├─ Settings → System → Notifications
├─ Make sure "Notifications" is ON
├─ Check app notifications are allowed
└─ Check "Do not disturb" is OFF

macOS:
├─ System Preferences → Notifications
├─ Find browser (Chrome/Safari)
├─ Check "Alert Style" is not "None"
└─ Check DND is off

Linux:
├─ Check your notification daemon
├─ Common: GNOME, KDE, XFCE notifications
└─ May need to configure
```

**Cause 2: Notifications being sent to wrong user**
```
Solution:
1. Check API payload is correct:
   {
     "recipientUser": "Mohona",  ← Correct?
     "senderUser": "Abrar",
     "message": "Hello!",
     "type": "message"
   }
2. Make sure recipientUser matches logged-in user
3. Check other user's account
```

**Cause 3: Browser notifications are muted**
```
Solution:
1. Check browser settings
2. Some browsers have app-level muting
3. Try temporarily disabling other notification apps
4. Reload page
```

**Cause 4: Firebase Console not getting permission**
```
Solution:
1. Check if you're sending from right project
2. Go to Firebase Console → Messaging
3. Make sure you're in "Mohona-Abrar" project
4. The token should be from this project
```

---

## 4. 🔴 "Notifications not reaching Android"

### Symptoms
- Web notifications work
- Android app doesn't get notifications

### Causes & Solutions

**Cause 1: Android app doesn't have notification permission**
```
Solution:
1. Go to Android Settings
2. Find your app (ChatApp)
3. Permissions → Notifications
4. Toggle ON
5. Reopen app
6. Send test notification
```

**Cause 2: Firebase not configured in Android app**
```
Solution:
1. Check AndroidManifest.xml has:
   <service
     android:name="com.google.firebase.messaging.FirebaseMessagingService"
     android:exported="false">
     <intent-filter>
       <action android:name="com.google.firebase.MESSAGING_EVENT" />
     </intent-filter>
   </service>

2. Check app uses same Firebase project
3. Rebuild and reinstall app
```

**Cause 3: Android FCM token different from web**
```
Solution:
1. Each device gets unique token
2. Web: one token (per browser)
3. Android: one token (per app)
4. Firebase sends to BOTH tokens
5. Both should receive when sending to user
6. Check both tokens exist in Firebase
```

**Cause 4: App was just installed**
```
Solution:
1. FCM tokens take time to generate
2. Just installed? Wait 30 seconds
3. Open app fully (not just download)
4. Try again
```

**Cause 5: App in "Doze" mode**
```
Solution (Android 6+):
1. Go to Settings → Battery
2. Battery Saver → App Standby
3. Whitelist your app
4. Or disable Battery Saver temporarily
```

---

## 5. 🔴 "Service Worker registration failed"

### Symptoms
- Console error: "Service Worker registration failed"
- Notifications don't work

### Causes & Solutions

**Cause 1: Service Worker file doesn't exist**
```
Solution:
1. Check file exists: public/firebase-messaging-sw.js
2. If not, it was already created for you
3. If missing, recreate from NOTIFICATION_SETUP.md
4. File must be in public/ folder (not src/)
```

**Cause 2: Wrong file path**
```
Solution:
1. Check _app.js has correct path:
   navigator.serviceWorker.register('/firebase-messaging-sw.js')
   
2. File must be exactly at:
   public/firebase-messaging-sw.js
   
3. URL path must be: /firebase-messaging-sw.js
   (not /public/firebase-messaging-sw.js)
```

**Cause 3: Service Worker has JavaScript errors**
```
Solution:
1. Check browser DevTools → Application
2. Click Service Workers
3. Look for errors
4. Check public/firebase-messaging-sw.js for syntax errors
5. Verify Firebase imports are correct
```

**Cause 4: Browser doesn't support Service Workers**
```
Solution:
1. Use modern browser:
   ✓ Chrome 40+
   ✓ Firefox 44+
   ✓ Safari 11.1+
   ✓ Edge 17+
2. Update browser if old
3. Notifications still work on non-supporting browsers
   (will just not work in background)
```

---

## 6. 🔴 "Notification shows but says 'New Message' generically"

### Symptoms
- Notification appears but title/body is generic
- Not showing actual message content

### Causes & Solutions

**Cause 1: Customization not applied**
```
Solution:
1. Edit public/firebase-messaging-sw.js
2. Find the onBackgroundMessage handler
3. Customize notificationTitle and notificationOptions:
   const notificationTitle = payload.notification?.title || 'New Message';
   const notificationOptions = {
     body: payload.notification?.body || 'You have a new notification',
     ...
   };
4. Save and reload
```

**Cause 2: Notification data not being sent**
```
Solution:
1. Check /api/notifications sends correct data
2. Verify sendNotification() passes the message
3. Example:
   sendNotification('Mohona', 'Abrar', 'Hello!', 'message')
   ↓ should result in notification with 'Hello!'
```

---

## 7. 🔴 "Notifications not working on Vercel"

### Symptoms
- Works locally but not in production
- No notifications on Vercel-deployed app

### Causes & Solutions

**Cause 1: Environment variables not set in Vercel**
```
Solution:
1. Go to vercel.com/dashboard
2. Select your ChatApp project
3. Click Settings → Environment Variables
4. Add all Firebase variables:
   NEXT_PUBLIC_FIREBASE_VAPID_KEY=xxx
   NEXT_PUBLIC_FIREBASE_SENDER_ID=xxx
   FIREBASE_DATABASE_URL=xxx
   FIREBASE_SERVICE_ACCOUNT=xxx
5. Redeploy (auto-triggered)
6. Wait 2-3 minutes
7. Test in production URL
```

**Cause 2: Service Worker not served**
```
Solution:
1. Check public/firebase-messaging-sw.js is committed to git
2. Vercel needs to see the file
3. Redeploy after ensuring file is committed
4. Test in production
```

**Cause 3: Mixed HTTP/HTTPS**
```
Solution:
1. Always use https://your-domain.vercel.app
2. Never http:// in production
3. Notifications require HTTPS
4. Vercel auto-handles this
```

**Cause 4: Firefox with mixed content**
```
Solution:
1. If using Firefox and sees errors
2. Make sure you're on https:// (not http)
3. Check browser console for mixed content warnings
4. Vercel handles this automatically
```

---

## 8. 🔴 "Getting 'notifications' is undefined"

### Symptoms
- Console error: "Cannot read property 'map' of undefined"
- Notification panel crashes

### Causes & Solutions

**Cause 1: API endpoint returns error**
```
Solution:
1. Check /api/notifications endpoint
2. Make sure it has GET method handler
3. Check database permissions in Firebase
4. Verify user parameter is passed
```

**Cause 2: Firebase connection issue**
```
Solution:
1. Check FIREBASE_DATABASE_URL in .env.local
2. Verify FIREBASE_SERVICE_ACCOUNT is valid JSON
3. Test Firebase connection:
   curl http://localhost:3000/api/messages
   (should return data, not error)
```

**Cause 3: State not initialized**
```
Solution in components/NotificationPanel.js:
// Make sure useEffect initializes state:
const [notifications, setNotifications] = useState([]);  ← Add this

// And initialization:
if (!currentUser) return null;  ← Add this guard
```

---

## 9. 🔴 "Clicking notification doesn't focus app"

### Symptoms
- Notification appears
- Clicking it doesn't return to app
- Stays in background

### Causes & Solutions

**Cause 1: Service Worker click handler not set**
```
Solution:
1. Check public/firebase-messaging-sw.js has:
   self.addEventListener('notificationclick', (event) => {
     event.notification.close();
     event.waitUntil(
       clients.matchAll(...).then(clientList => {
         // Find and focus window
         ...
       })
     );
   });

2. If missing, add from NOTIFICATION_SETUP.md
3. Reload
```

**Cause 2: App window closed**
```
Solution:
1. Service Worker will open new window
2. Check if new window opens after clicking
3. If not, check browser console for errors
```

---

## 10. 🔴 "Getting CORS errors"

### Symptoms
- Console shows CORS errors
- `OPTIONS /api/notifications 404`

### Causes & Solutions

**Cause 1: API endpoint not set up**
```
Solution:
1. Make sure pages/api/notifications.js exists
2. Check it handles POST, GET, PUT methods
3. If missing, it was created for you
4. Restart dev server
```

**Cause 2: Next.js API routes issue**
```
Solution:
1. Check file is in correct folder:
   pages/api/notifications.js (not src/pages/api)
2. Restart dev server
3. Test: curl http://localhost:3000/api/notifications
```

---

## Debug Checklist

Copy-paste this into browser console to check everything:

```javascript
// Check 1: Service Worker
navigator.serviceWorker.getRegistrations()
  .then(regs => console.log('Service Workers:', regs.length > 0 ? 'REGISTERED ✓' : 'NOT REGISTERED ✗'));

// Check 2: Notification Permission
console.log('Notification Permission:', Notification.permission);

// Check 3: Environment Variables
console.log('VAPID Key exists:', !!process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ? '✓' : '✗');

// Check 4: Firebase Connection
fetch('/api/notifications?user=test')
  .then(r => r.json())
  .then(data => console.log('Firebase API:', data.ok ? 'CONNECTED ✓' : 'ERROR ✗', data))
  .catch(e => console.log('Firebase API: FAILED ✗', e.message));

// Check 5: All together
console.log(
  'System Status:',
  {
    serviceWorker: 'Check above ↑',
    permission: Notification.permission,
    vapidKey: !!process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    firebase: 'Test with fetch ↑'
  }
);
```

---

## Still Not Working?

1. **Read documentation in order:**
   - `NOTIFICATION_SETUP.md` (quick start)
   - `NOTIFICATION_INTEGRATION.md` (detailed)
   - `NOTIFICATION_ARCHITECTURE.md` (how it works)

2. **Check browser console** for actual error messages

3. **Verify all files created:**
   ```
   pages/api/notifications.js
   lib/firebaseMessaging.js
   public/firebase-messaging-sw.js
   components/NotificationPanel.js
   styles/notifications.module.css
   ```

4. **Test with fresh browser:**
   - Incognito mode
   - Clear cache/cookies
   - Restart dev server

5. **Restart from scratch:**
   - Stop dev server (Ctrl+C)
   - Delete node_modules/.cache
   - Restart: npm run dev

---

## Getting Help

If still stuck:

1. Check **exact error message** in console
2. Find that error in this document (Ctrl+F)
3. Follow the solution
4. If not found, check related sections
5. Read the detailed guide for that feature

---

**Most common fixes:**
- ✅ Restart dev server
- ✅ Clear browser cache
- ✅ Check .env.local
- ✅ Verify VAPID key
- ✅ Check Firebase Console

**80% of issues** are fixed by one of these! 🚀
