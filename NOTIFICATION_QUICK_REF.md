# 🔔 Firebase Notifications - Quick Reference Card

## 📦 New Files Created

```
pages/api/notifications.js          Backend API endpoint
lib/firebaseMessaging.js            Frontend FCM client
public/firebase-messaging-sw.js     Service worker
components/NotificationPanel.js     UI component
styles/notifications.module.css     Styling
NOTIFICATION_SETUP.md               Start here!
NOTIFICATION_INTEGRATION.md         Step-by-step guide
NOTIFICATION_ARCHITECTURE.md        How it works
NOTIFICATION_CHECKLIST.js           Setup checklist
```

---

## 🚀 Three Steps to Get Notifications

### 1️⃣ Get VAPID Key (Firebase Console)
```
https://console.firebase.google.com
→ Project Settings
→ Cloud Messaging tab
→ Copy VAPID Key
```

### 2️⃣ Add to `.env.local`
```env
NEXT_PUBLIC_FIREBASE_VAPID_KEY="your_vapid_key_here"
```

### 3️⃣ Integrate into `chat.js`
```javascript
// Add imports
import NotificationPanel from '@/components/NotificationPanel';
import { requestPermissionAndGetToken, sendNotification } from '@/lib/firebaseMessaging';

// Add to buttons area
<NotificationPanel currentUser={currentUser} />

// Request permission in useEffect
const token = await requestPermissionAndGetToken();

// Send notification when message sent
await sendNotification(otherUser, currentUser, messageText);
```

---

## 📊 API Endpoints

### Send Notification
```
POST /api/notifications
{
  "recipientUser": "Mohona",
  "senderUser": "Abrar",
  "message": "Hello!",
  "type": "message"
}
→ { ok: true, notification: {...} }
```

### Get Notifications
```
GET /api/notifications?user=Mohona
→ { ok: true, notifications: [...], unreadCount: 3 }
```

### Mark as Read
```
PUT /api/notifications
{
  "user": "Mohona",
  "notificationId": "1702758000000"
}
→ { ok: true }
```

---

## 💻 Code Examples

### Request Permission
```javascript
import { requestPermissionAndGetToken } from '@/lib/firebaseMessaging';

const token = await requestPermissionAndGetToken();
console.log('Token:', token);
```

### Send Notification
```javascript
import { sendNotification } from '@/lib/firebaseMessaging';

await sendNotification('Mohona', 'Abrar', 'Hello Mohona!', 'message');
```

### Listen for Foreground Messages
```javascript
import { listenForForegroundMessages } from '@/lib/firebaseMessaging';

listenForForegroundMessages((payload) => {
  console.log('Notification:', payload.notification.body);
});
```

### Get All Notifications
```javascript
import { getUserNotifications } from '@/lib/firebaseMessaging';

const { notifications, unreadCount } = await getUserNotifications('Mohona');
```

### Mark Notification as Read
```javascript
import { markNotificationAsRead } from '@/lib/firebaseMessaging';

await markNotificationAsRead('Mohona', '1702758000000');
```

---

## 🎯 Notification Types

```javascript
// Message
sendNotification(recipient, sender, 'New message!', 'message');

// Typing
sendNotification(recipient, sender, 'is typing...', 'typing');

// Online
sendNotification(recipient, sender, 'came online', 'online');

// Reaction
sendNotification(recipient, sender, 'reacted 🖤', 'reaction');
```

---

## 📱 Where Notifications Show

```
Browser:
├─ Foreground: Notification in corner (if app open)
├─ Background: Service Worker shows notification
└─ Both: Clicking goes back to app

Android:
├─ Notification tray at top
├─ Lock screen (depending on settings)
└─ Badge on app icon
```

---

## ⚙️ Component Files Updated

### `pages/_app.js` - Add Service Worker Registration
```javascript
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
      .then(reg => console.log('Service Worker registered'))
      .catch(err => console.error('Registration failed:', err));
  }
}, []);
```

### `pages/chat.js` - Integrate Notifications
Add to imports:
```javascript
import NotificationPanel from '@/components/NotificationPanel';
import { requestPermissionAndGetToken, listenForForegroundMessages, sendNotification } from '@/lib/firebaseMessaging';
```

Add to JSX (header buttons):
```javascript
<NotificationPanel currentUser={currentUser} />
```

Add to useEffect:
```javascript
const token = await requestPermissionAndGetToken();
listenForForegroundMessages((payload) => {
  console.log('Notification:', payload);
});
```

Add to handleSendMessage (after message sent):
```javascript
await sendNotification(otherUser, currentUser, messageText);
```

---

## 🔧 Environment Variables

### `.env.local` (Add these)
```env
NEXT_PUBLIC_FIREBASE_VAPID_KEY="your_vapid_key"
```

### `.env.local` (Already have these)
```env
FIREBASE_DATABASE_URL="https://mohona-abrar-default-rtdb.asia-southeast1.firebasedatabase.app"
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
```

---

## 🧪 Testing

### Browser Test
1. Open http://localhost:3000
2. Grant notification permission
3. Check console for token
4. Send message
5. See notification

### Android Test
1. Open Android app
2. Log in with same account
3. Send message from web
4. See notification on Android

---

## ✅ Checklist

- [ ] Step 1: Get VAPID Key
- [ ] Step 2: Add to `.env.local`
- [ ] Step 3: Update `_app.js`
- [ ] Step 4: Update `chat.js`
- [ ] Step 5: Test on web
- [ ] Step 6: Test on Android
- [ ] Step 7: Deploy to Vercel
- [ ] Step 8: Final testing

---

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| No VAPID key | Go to Firebase Console → Cloud Messaging |
| Permission not asked | Restart dev server, clear cache |
| FCM token null | Check VAPID key is correct |
| No notification | Check `.env.local`, browser console |
| Android not getting | Check app has notification permission |
| Service Worker error | Check `/firebase-messaging-sw.js` exists |

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `NOTIFICATION_SETUP.md` | ← Start here! |
| `NOTIFICATION_INTEGRATION.md` | Step-by-step instructions |
| `NOTIFICATION_ARCHITECTURE.md` | Visual diagrams & how it works |
| `FIREBASE_NOTIFICATIONS_GUIDE.md` | Complete reference |
| `NOTIFICATION_CHECKLIST.js` | Interactive checklist |

---

## 🎉 Success Indicators

✅ Browser asks for notification permission
✅ Token appears in console
✅ Notification bell icon shows
✅ Notifications appear when message sent
✅ Can mark as read
✅ Works on both web and Android

---

## 🚀 What's Next?

After setup, you can:
- Send notifications for typing: `sendNotification(recipient, sender, 'is typing...')`
- Send notifications for online: `sendNotification(recipient, sender, 'came online')`
- Send notifications for reactions: `sendNotification(recipient, sender, 'reacted 🖤')`
- Customize notification styles in `styles/notifications.module.css`
- Add notification sounds
- Add notification grouping

---

**Questions?** Read `NOTIFICATION_INTEGRATION.md` for detailed instructions! 📖
