// Firebase Messaging Client Library
// Initialize Firebase Cloud Messaging in the browser

import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyC9yG5vQ5c8nN8kqG5vQ5c8nN8kqG5vQ5c",
  authDomain: "mohona-abrar.firebaseapp.com",
  projectId: "mohona-abrar",
  storageBucket: "mohona-abrar.appspot.com",
  messagingSenderId: "101786293123501716130",
  appId: "1:101786293123501716130:web:abcdef123456"
};

// Initialize Firebase
let app;
let messaging;

try {
  app = initializeApp(firebaseConfig);
  messaging = getMessaging(app);
  console.log('Firebase Messaging initialized');
} catch (error) {
  console.error('Firebase Messaging initialization error:', error);
}

// Request permission and get FCM token
export async function requestPermissionAndGetToken() {
  try {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return null;
    }

    // Check if already granted
    if (Notification.permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
      });
      console.log('FCM Token:', token);
      return token;
    }

    // Request permission
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
        });
        console.log('FCM Token:', token);
        return token;
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

// Listen for foreground messages
export function listenForForegroundMessages(callback) {
  if (!messaging) {
    console.error('Messaging not initialized');
    return;
  }

  onMessage(messaging, (payload) => {
    console.log('Foreground message:', payload);

    // Show notification
    if (Notification.permission === 'granted') {
      new Notification(payload.notification?.title || 'New Message', {
        body: payload.notification?.body || 'You have a new notification',
        icon: '/logo.png',
        badge: '/badge.png'
      });
    }

    // Call the callback
    if (callback) {
      callback(payload);
    }
  });
}

// Send notification via API
export async function sendNotification(recipientUser, senderUser, message, type = 'message') {
  try {
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recipientUser,
        senderUser,
        message,
        type
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send notification');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}

// Get user notifications
export async function getUserNotifications(user) {
  try {
    const response = await fetch(`/api/notifications?user=${user}`);
    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { ok: false, notifications: [] };
  }
}

// Mark notification as read
export async function markNotificationAsRead(user, notificationId) {
  try {
    const response = await fetch('/api/notifications', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user,
        notificationId
      })
    });

    if (!response.ok) {
      throw new Error('Failed to mark as read');
    }

    return await response.json();
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

export default messaging;
