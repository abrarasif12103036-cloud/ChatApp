# Firebase Cloud Messaging Setup Guide

## Enable FCM in Your Project

### Step 1: Enable Cloud Messaging in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select **Mohona-Abrar** project
3. Go to **Messaging** (left sidebar)
4. Click **Enable Firebase Cloud Messaging**

### Step 2: Get VAPID Key

1. In **Firebase Console**, go to **Project Settings** (gear icon)
2. Click **Cloud Messaging** tab
3. Copy your **Server API Key** and **Sender ID**
4. Under **Web Credentials**, you'll see the **VAPID Key**

### Step 3: Update Environment Variables

Add to `.env.local`:

```
NEXT_PUBLIC_FIREBASE_VAPID_KEY="your_vapid_key_here"
NEXT_PUBLIC_FIREBASE_SENDER_ID="your_sender_id_here"
```

### Step 4: Update Firebase Config

Edit `lib/firebaseMessaging.js` and replace:
- `apiKey`
- `authDomain`
- `appId`

With your actual Firebase credentials from Firebase Console.

---

## Web Push Notifications

### How It Works:

1. **User grants permission** → Browser asks for notification access
2. **Get FCM Token** → Unique identifier for this device
3. **Store token** → Send to backend to link with user
4. **Send notification** → Backend sends via Firebase Admin SDK
5. **Show notification** → Browser displays to user

### In Your Chat App:

```javascript
import { requestPermissionAndGetToken, listenForForegroundMessages } from '@/lib/firebaseMessaging';

// Request permission when user logs in
useEffect(() => {
  const token = await requestPermissionAndGetToken();
  console.log('User token:', token);
}, []);

// Listen for incoming notifications
listenForForegroundMessages((payload) => {
  console.log('New notification:', payload);
  // Update your UI
});
```

---

## Android App Notifications

Your Android app will automatically receive notifications because:

1. Both web and Android use **Firebase Cloud Messaging**
2. Same Firebase project: **Mohona-Abrar**
3. Each user has an FCM token (web and Android)
4. Backend sends to all tokens for that user

### Android Configuration:

Already done! Your `AndroidManifest.xml` has:
```xml
<service android:name="com.google.firebase.messaging.FirebaseMessagingService" />
```

---

## Send Notifications from Backend

### Option 1: Via API (Recommended)

```javascript
// In your chat.js when sending a message
await fetch('/api/notifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recipientUser: otherUser,
    senderUser: currentUser,
    message: 'New message from ' + currentUser,
    type: 'message'
  })
});
```

### Option 2: Backend Admin Script

```javascript
import admin from 'firebase-admin';

const messaging = admin.messaging();

// Send to specific user
await messaging.send({
  notification: {
    title: 'New Message',
    body: 'Abrar: Hello there!'
  },
  webpush: {
    fcmOptions: { link: 'https://your-app.com' }
  },
  token: userFCMToken
});
```

---

## Notification Types

```javascript
// Message notification
sendNotification(otherUser, currentUser, 'New message: Hello!', 'message');

// Typing notification
sendNotification(otherUser, currentUser, currentUser + ' is typing...', 'typing');

// Online notification
sendNotification(otherUser, currentUser, currentUser + ' came online', 'online');

// Reaction notification
sendNotification(otherUser, currentUser, currentUser + ' reacted 🖤', 'reaction');
```

---

## Test Notifications

### In Browser:

1. Open your app: http://localhost:3000
2. Grant notification permission
3. Open Firebase Console → **Messaging**
4. Click **Send your first message**
5. Fill in title and text
6. Select **Web** platform
7. Click **Send**
8. Watch notifications appear!

### For Android:

Same process, but select **Android** platform instead of Web.

---

## Database Structure

Notifications are stored in Firebase:

```
notifications/
├── boy/
│   ├── 1702758000000/
│   │   ├── senderUser: "girl"
│   │   ├── message: "Hi there!"
│   │   ├── timestamp: "2025-12-16T..."
│   │   └── read: false
│   └── ...
└── girl/
    └── ...
```

---

## API Endpoints

### Send Notification
```
POST /api/notifications
{
  "recipientUser": "boy",
  "senderUser": "girl",
  "message": "Hello!",
  "type": "message"
}
```

### Get User Notifications
```
GET /api/notifications?user=boy
```

Response:
```json
{
  "ok": true,
  "notifications": [...],
  "unreadCount": 3
}
```

### Mark as Read
```
PUT /api/notifications
{
  "user": "boy",
  "notificationId": "1702758000000"
}
```

---

## Next Steps

1. ✅ Add VAPID Key to `.env.local`
2. ✅ Update Firebase config in `lib/firebaseMessaging.js`
3. ✅ Integrate notifications in `pages/chat.js`
4. ✅ Test on both web and Android
5. ✅ Deploy to Vercel

---

## Troubleshooting

**"Notifications not supported"**
- Browser must support Web Notifications API
- User must grant permission

**"FCM Token null"**
- Check VAPID Key is correct
- Check Firebase Console has Cloud Messaging enabled
- Check user granted notification permission

**"Notifications not showing on Android"**
- Check Firebase Admin SDK is configured
- Check `AndroidManifest.xml` has messaging service
- Check app has notification permission on Android

---

**Your notification system is ready!** 🔔
