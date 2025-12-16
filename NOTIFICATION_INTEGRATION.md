# Firebase Notifications Integration Guide

## What's Been Added

I've created a complete **Firebase Cloud Messaging (FCM)** notification system that works on:
- ✅ **Web App** (Browser notifications)
- ✅ **Android App** (Native Android notifications)

---

## Files Created

### 1. **`pages/api/notifications.js`** - Backend Notification API
- `POST` - Send a notification
- `GET` - Get user notifications
- `PUT` - Mark notification as read

### 2. **`lib/firebaseMessaging.js`** - Frontend FCM Client
- Request notification permission
- Get FCM token
- Listen for foreground messages
- Send notifications via API

### 3. **`public/firebase-messaging-sw.js`** - Service Worker
- Handle background notifications
- Show browser notifications
- Handle notification clicks

### 4. **`components/NotificationPanel.js`** - UI Component
- Notification bell icon with badge
- Notification panel showing all notifications
- Mark as read functionality

### 5. **`styles/notifications.module.css`** - Notification Styles
- Cyber/futuristic theme matching your app
- Responsive mobile design

### 6. **`FIREBASE_NOTIFICATIONS_GUIDE.md`** - Documentation
- Setup instructions
- API reference
- Troubleshooting guide

---

## Quick Start

### Step 1: Enable Firebase Cloud Messaging

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select **Mohona-Abrar** project
3. Click **Messaging** in left sidebar
4. Click **Enable Firebase Cloud Messaging**

### Step 2: Get VAPID Key

1. In Firebase Console → **Project Settings** (gear icon)
2. Click **Cloud Messaging** tab
3. Copy the **VAPID Key** (under "Web credentials")

### Step 3: Update `.env.local`

Add this line:

```
NEXT_PUBLIC_FIREBASE_VAPID_KEY="paste_your_vapid_key_here"
```

Your `.env.local` should now have:

```
NEXT_PUBLIC_FIREBASE_VAPID_KEY="your_vapid_key_here"
NEXT_PUBLIC_FIREBASE_SENDER_ID="your_sender_id_here"
NEXT_PUBLIC_BOY_USER="Abrar"
NEXT_PUBLIC_BOY_PASS="Abrarasif"
NEXT_PUBLIC_GIRL_USER="Mohona"
NEXT_PUBLIC_GIRL_PASS="Mohona2024"
FIREBASE_DATABASE_URL="https://mohona-abrar-default-rtdb.asia-southeast1.firebasedatabase.app"
FIREBASE_SERVICE_ACCOUNT='your_service_account_json'
```

### Step 4: Register Service Worker

Edit `pages/_app.js`:

```javascript
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Register service worker for notifications
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then(reg => console.log('Service Worker registered'))
        .catch(err => console.error('Service Worker registration failed:', err));
    }
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
```

### Step 5: Add Notification Panel to Chat

Edit `pages/chat.js` - Add at the top of imports:

```javascript
import NotificationPanel from '@/components/NotificationPanel';
```

Add this in the header (around line 570 where you have buttons):

```javascript
// Add this in the header section, before the buttons div
<NotificationPanel currentUser={currentUser} />
```

Or in the buttons div:

```javascript
<div className={styles.buttons}>
  <NotificationPanel currentUser={currentUser} />
  <button onClick={clearChat} className={styles.btnSecondary}>Clear</button>
  <button onClick={handleReload} className={styles.btnReload} title="Reload messages">↻</button>
  <button onClick={handleLogout} className={styles.btnLogout}>Logout</button>
</div>
```

### Step 6: Request Notification Permission

Add this to `pages/chat.js` useEffect (around line 120):

```javascript
// Add this inside the useEffect hook, after setIsLoading(false)
import { requestPermissionAndGetToken, listenForForegroundMessages, sendNotification } from '@/lib/firebaseMessaging';

// Request notification permission when user logs in
setTimeout(async () => {
  const token = await requestPermissionAndGetToken();
  console.log('Notification token:', token);
}, 1000);

// Listen for foreground messages
listenForForegroundMessages((payload) => {
  console.log('Foreground notification received:', payload);
});
```

### Step 7: Send Notifications on Message

Modify `handleSendMessage()` in `pages/chat.js`:

```javascript
// Add this after the message is sent successfully
// Send notification to other user
try {
  await sendNotification(otherUser, currentUser, `${currentUser}: ${inputValue || '📷 Image'}`);
} catch (error) {
  console.error('Failed to send notification:', error);
}
```

---

## How Notifications Work

### Web (Browser)

1. **User grants permission** → Browser asks "Allow notifications?"
2. **Get FCM Token** → Unique ID for this device
3. **Store token** → Backend links token to user
4. **Send message** → App sends notification via API
5. **Show notification** → Browser displays notification

### Android

1. **App has Firebase configured** ✓ (Already done in `AndroidManifest.xml`)
2. **FCM Service running** ✓ (Already listening for notifications)
3. **Send to Android token** → Backend sends to Android FCM token
4. **Show notification** → Android displays as native notification

Both platforms use the **same Firebase project**, so notifications go to all devices for that user!

---

## Notification Types

You can send different types of notifications:

```javascript
// Message notification
await sendNotification(otherUser, currentUser, 'New message from ' + currentUser, 'message');

// Typing notification
await sendNotification(otherUser, currentUser, currentUser + ' is typing...', 'typing');

// Online notification
await sendNotification(otherUser, currentUser, currentUser + ' came online', 'online');

// Reaction notification
await sendNotification(otherUser, currentUser, currentUser + ' reacted 🖤', 'reaction');
```

---

## API Reference

### Send Notification

```
POST /api/notifications
Content-Type: application/json

{
  "recipientUser": "Mohona",
  "senderUser": "Abrar",
  "message": "Hello there!",
  "type": "message"
}
```

Response:
```json
{
  "ok": true,
  "notification": {
    "id": "1702758000000",
    "recipientUser": "Mohona",
    "senderUser": "Abrar",
    "message": "Hello there!",
    "timestamp": "2025-12-16T10:30:00Z",
    "read": false
  }
}
```

### Get User Notifications

```
GET /api/notifications?user=Mohona
```

Response:
```json
{
  "ok": true,
  "notifications": [
    {
      "id": "1702758000000",
      "recipientUser": "Mohona",
      "senderUser": "Abrar",
      "message": "Hello!",
      "timestamp": "2025-12-16T10:30:00Z",
      "read": false
    }
  ],
  "unreadCount": 3
}
```

### Mark as Read

```
PUT /api/notifications
Content-Type: application/json

{
  "user": "Mohona",
  "notificationId": "1702758000000"
}
```

---

## Firebase Database Structure

Notifications are stored at:

```
notifications/
├── Abrar/
│   ├── 1702758000000/
│   │   ├── senderUser: "Mohona"
│   │   ├── message: "Hi Abrar!"
│   │   ├── type: "message"
│   │   ├── timestamp: "2025-12-16T10:30:00Z"
│   │   └── read: false
│   └── 1702758000001/
│       ├── senderUser: "Mohona"
│       ├── message: "How are you?"
│       └── ...
└── Mohona/
    ├── 1702758000002/
    │   ├── senderUser: "Abrar"
    │   └── ...
    └── ...
```

---

## Testing Notifications

### Test in Browser

1. Open **http://localhost:3000**
2. Grant notification permission when prompted
3. Check browser console for FCM token
4. Open Firebase Console → **Messaging**
5. Click **Send your first message**
6. Select **Web** platform
7. Add title and message
8. Click **Send**
9. Watch notification appear in browser!

### Test Android

Same steps, but select **Android** platform instead of Web when sending in Firebase Console.

### Test from Your App

In `pages/chat.js`:

```javascript
// Send test notification
const testNotification = async () => {
  try {
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientUser: 'Abrar',
        senderUser: 'Mohona',
        message: 'Test notification!',
        type: 'message'
      })
    });
    console.log('Test notification sent:', response.ok);
  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Call: testNotification();
```

---

## Troubleshooting

### Problem: "Notifications not supported"
**Solution:** Browser doesn't support Web Notifications API (very rare)
- Use Chrome, Firefox, Safari, or Edge

### Problem: "FCM Token null"
**Solution:** VAPID Key is wrong or Firebase not properly configured
- Check `.env.local` has correct `NEXT_PUBLIC_FIREBASE_VAPID_KEY`
- Check Firebase Console has Cloud Messaging enabled
- Try deleting browser cache and reloading

### Problem: "Notifications not showing on Android"
**Solution:** Firebase admin SDK not sending to Android token
- Check `FirebaseMessagingService` in `AndroidManifest.xml`
- Ensure app has notification permission
- Try clearing Android app cache

### Problem: "Service Worker not registered"
**Solution:** Service worker file path is wrong
- Ensure `public/firebase-messaging-sw.js` exists
- Reload browser after adding service worker

### Problem: "Notifications showing as "New Message" generically"
**Solution:** Customize notification title and body
- Edit `public/firebase-messaging-sw.js` to customize notification styling

---

## Advanced: Send via Admin SDK

You can also send notifications from backend using Firebase Admin SDK:

```javascript
// In a server-side API route
import admin from 'firebase-admin';

export default async function handler(req, res) {
  const messaging = admin.messaging();

  try {
    await messaging.send({
      notification: {
        title: 'New Message',
        body: 'Abrar: Hello there!'
      },
      webpush: {
        fcmOptions: { 
          link: 'http://localhost:3000' 
        }
      },
      token: userFCMToken
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}
```

---

## Deployment to Vercel

When deploying to Vercel, add these environment variables:

```
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key_here
NEXT_PUBLIC_FIREBASE_SENDER_ID=your_sender_id_here
FIREBASE_DATABASE_URL=https://mohona-abrar-default-rtdb.asia-southeast1.firebasedatabase.app
FIREBASE_SERVICE_ACCOUNT=your_service_account_json_here
```

Then:
1. Push code to GitHub
2. Vercel auto-deploys
3. Users get notifications on your production URL too!

---

## What's Next?

✅ FCM system is ready
✅ Backend API created
✅ UI component built
- [ ] Integrate into chat.js (you'll do this)
- [ ] Request notification permission (you'll do this)
- [ ] Test on browser and Android
- [ ] Deploy to Vercel

---

**Your notification system is complete!** 🔔

Want to:
- Send notifications when someone comes online?
- Send typing notifications?
- Send reaction notifications?

Just call `sendNotification()` at the right places in your code!

---

## Quick Reference

```javascript
// Import
import { 
  requestPermissionAndGetToken,
  listenForForegroundMessages,
  sendNotification,
  getUserNotifications,
  markNotificationAsRead
} from '@/lib/firebaseMessaging';

// Request permission
const token = await requestPermissionAndGetToken();

// Send notification
await sendNotification('Mohona', 'Abrar', 'Hello!', 'message');

// Get notifications
const data = await getUserNotifications('Mohona');

// Mark as read
await markNotificationAsRead('Mohona', '1702758000000');

// Listen for foreground messages
listenForForegroundMessages((payload) => {
  console.log('Notification:', payload);
});
```

---

**Questions?** Check `FIREBASE_NOTIFICATIONS_GUIDE.md` for more details!
