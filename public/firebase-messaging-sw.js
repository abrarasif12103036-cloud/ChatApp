// Service Worker for Firebase Cloud Messaging and Web Notifications
// This file handles background notifications

// Check if this is a service worker context
if (typeof importScripts === 'function') {
  importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
  importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

  // Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyC9yG5vQ5c8nN8kqG5vQ5c8nN8kqG5vQ5c", // Will be injected from env
    authDomain: "mohona-abrar.firebaseapp.com",
    projectId: "mohona-abrar",
    storageBucket: "mohona-abrar.appspot.com",
    messagingSenderId: "101786293123501716130",
    appId: "1:101786293123501716130:web:..."
  };

  // Initialize Firebase in Service Worker
  firebase.initializeApp(firebaseConfig);

  // Retrieve Firebase Messaging object
  const messaging = firebase.messaging();

  // Handle background messages
  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);

    const notificationTitle = payload.notification?.title || 'New Message';
    const notificationOptions = {
      body: payload.notification?.body || 'You have a new notification',
      icon: '/logo.png',
      badge: '/badge.png',
      tag: 'chat-notification',
      requireInteraction: false,
      data: payload.data || {}
    };

    // Show notification
    self.registration.showNotification(notificationTitle, notificationOptions);
  });

  // Handle notification click
  self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification click:', event);

    event.notification.close();

    // Open or focus the app window
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Check if there's already a window/tab open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // If not, open a new window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  });
}
