# 🔔 Firebase Notifications System - Complete Setup

## ✅ What's Been Created

I've built a complete Firebase Cloud Messaging (FCM) system that sends notifications to:
- **Web App** (Browser notifications)
- **Android App** (Native Android notifications)

Both use the same Firebase project, so when you send a notification, it reaches all user devices!

---

## 📁 New Files

| File | Purpose |
|------|---------|
| `pages/api/notifications.js` | Backend API to send/receive notifications |
| `lib/firebaseMessaging.js` | Frontend FCM client library |
| `public/firebase-messaging-sw.js` | Service Worker for background notifications |
| `components/NotificationPanel.js` | UI component showing notifications |
| `styles/notifications.module.css` | Notification panel styling |
| `NOTIFICATION_INTEGRATION.md` | **← Read this first!** |
| `FIREBASE_NOTIFICATIONS_GUIDE.md` | Complete reference guide |

---

## 🚀 Next Steps (You'll Do These)

### Step 1: Get VAPID Key
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select **Mohona-Abrar** project
3. Go to **Project Settings** (gear icon) → **Cloud Messaging** tab
4. Copy the **VAPID Key**

### Step 2: Update `.env.local`
Add this line to your `.env.local`:
```
NEXT_PUBLIC_FIREBASE_VAPID_KEY="paste_your_vapid_key_here"
```

### Step 3: Update `pages/_app.js`
Add this to register the service worker:

```javascript
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
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

### Step 4: Integrate into `pages/chat.js`
1. Import notification components at the top:
```javascript
import NotificationPanel from '@/components/NotificationPanel';
import { 
  requestPermissionAndGetToken,
  listenForForegroundMessages,
  sendNotification
} from '@/lib/firebaseMessaging';
```

2. Add to header (in buttons section):
```javascript
<div className={styles.buttons}>
  <NotificationPanel currentUser={currentUser} />
  {/* ... other buttons ... */}
</div>
```

3. Request permission when user logs in (in useEffect):
```javascript
// After setIsLoading(false)
setTimeout(async () => {
  const token = await requestPermissionAndGetToken();
  console.log('Notification token:', token);
}, 1000);

// Listen for foreground messages
listenForForegroundMessages((payload) => {
  console.log('Notification received:', payload);
});
```

4. Send notification when message is sent (in `handleSendMessage()`):
```javascript
// After message is successfully sent
try {
  await sendNotification(otherUser, currentUser, `${currentUser}: ${inputValue || '📷 Image'}`);
} catch (error) {
  console.error('Failed to send notification:', error);
}
```

### Step 5: Test
1. Run `npm run dev`
2. Grant notification permission when prompted
3. Send a message
4. Check both web app and Android app for notifications!

---

## 📊 How It Works

```
┌─────────────────────────────────────────────────┐
│          Your Chat App                          │
│  ┌──────────────────────────────────────────┐  │
│  │ Send Message + sendNotification()        │  │
│  └──────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
         ┌──────────────────────────┐
         │  /api/notifications      │
         │  (Save to Firebase)      │
         └──────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
    ┌─────────────┐         ┌──────────────┐
    │ Web FCM     │         │ Android FCM  │
    │ (Browser)   │         │ (Native App) │
    └──────┬──────┘         └──────┬───────┘
           │                       │
           ▼                       ▼
    ┌─────────────┐         ┌──────────────┐
    │ Browser     │         │ Android      │
    │ Notification│         │ Notification │
    └─────────────┘         └──────────────┘
```

---

## 🔐 Security

- Service account key is in `.env.local` (not committed to git)
- VAPID key is public (it's meant to be)
- Notifications only go to the recipient user
- Firebase rules enforce user isolation

---

## 📱 Features

✅ **Web Notifications**
- Browser notifications on foreground
- Service Worker handles background notifications
- Click notification to return to app

✅ **Android Notifications**
- Native Android notifications
- Same Firebase project sends to both

✅ **Notification Panel**
- Bell icon with unread count
- Shows all notifications with timestamps
- Mark notifications as read
- Real-time updates

✅ **Multiple Types**
- Message notifications
- Typing notifications
- Online status notifications
- Reaction notifications

---

## 📚 Documentation

**Read in this order:**

1. **`NOTIFICATION_INTEGRATION.md`** ← **Start here!**
   - Quick start guide
   - Integration steps
   - API reference
   - Troubleshooting

2. **`FIREBASE_NOTIFICATIONS_GUIDE.md`**
   - Detailed setup
   - How it works
   - Advanced usage
   - Testing guide

---

## 🐛 Troubleshooting

### "Notification permission prompt not showing"
- Check if permission already granted/denied in browser
- Try incognito mode
- Check browser console for errors

### "FCM token is null"
- Check VAPID key is correct in `.env.local`
- Try restarting dev server
- Clear browser cache

### "Notifications not reaching Android"
- Check Android app has notification permission
- Check `AndroidManifest.xml` has FCM service (already done)
- Try uninstalling and reinstalling app

### "Notifications showing generic title"
- Update `public/firebase-messaging-sw.js` to customize

---

## 📞 Quick Reference

```javascript
// Request permission
await requestPermissionAndGetToken();

// Send notification
await sendNotification('Mohona', 'Abrar', 'Hello!');

// Get notifications
const { notifications, unreadCount } = await getUserNotifications('Mohona');

// Mark as read
await markNotificationAsRead('Mohona', notificationId);

// Listen for foreground messages
listenForForegroundMessages((payload) => {
  console.log('Got:', payload);
});
```

---

## ✨ You're Almost Done!

Just need to:
1. Get VAPID key from Firebase
2. Add to `.env.local`
3. Update `_app.js`, `chat.js`, and `pages` files with the code above
4. Test it out!

Once you integrate these into your `chat.js`, notifications will:
- Show in the app notification panel
- Show browser notifications
- Show on Android app
- All in real-time! 🚀

---

## 💡 Next Features (Optional)

You can also send notifications for:
- User comes online
- User starts typing
- User reacted to message
- And more!

Just call `sendNotification()` at the right time in your code.

---

**Questions?** Read `NOTIFICATION_INTEGRATION.md` for detailed instructions! 📖
