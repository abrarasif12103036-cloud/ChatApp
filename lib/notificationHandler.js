/**
 * Notification Handler Utility
 * Handles notifications for both web and Android app
 */

// Diagnostic: Log bridge status when module loads
if (typeof window !== 'undefined') {
  console.log('=== NotificationHandler Module Loaded ===');
  console.log('Is Android app (has window.AndroidNotification):', typeof window.AndroidNotification !== 'undefined');
  console.log('window.AndroidNotification:', window.AndroidNotification);
  console.log('=== End NotificationHandler Diagnostics ===\n');
}

export const NotificationHandler = {
  /**
   * Show notification on Android app
   * Uses JavaScript bridge to native Android notification system
   */
  showAndroidNotification(title, message, sender) {
    console.log('showAndroidNotification called:', { title, message, sender });
    if (window.AndroidNotification) {
      try {
        console.log('Android bridge available, sending notification...');
        window.AndroidNotification.showNotification(title, message, sender);
        console.log('Android notification sent successfully');
      } catch (error) {
        console.warn('Android notification failed:', error);
      }
    } else {
      console.warn('Android bridge NOT available (window.AndroidNotification is undefined)');
    }
  },

  /**
   * Show web notification (works on both web and Android browsers)
   */
  showWebNotification(title, message, options = {}) {
    console.log('showWebNotification called:', { title, message, options });
    if ('Notification' in window) {
      console.log('Notification API available, permission:', Notification.permission);
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body: message,
          icon: '/icon.png',
          badge: '/badge.png',
          ...options
        });
        console.log('Web notification sent');
      } else if (Notification.permission !== 'denied') {
        console.log('Requesting notification permission...');
        Notification.requestPermission().then(permission => {
          console.log('Permission result:', permission);
          if (permission === 'granted') {
            new Notification(title, {
              body: message,
              icon: '/icon.png',
              badge: '/badge.png',
              ...options
            });
          }
        });
      } else {
        console.warn('Notifications are denied by user');
      }
    } else {
      console.warn('Notification API NOT available in this browser');
    }
  },

  /**
   * Unified notification function - shows both Android native and web notifications
   */
  notify(title, message, sender, type = 'message') {
    console.log('=== NOTIFICATION TRIGGERED ===');
    console.log('Type:', type);
    console.log('Sender:', sender);
    console.log('Message:', message);
    
    const isAndroid = window.AndroidNotification !== undefined;
    console.log('Is Android App:', isAndroid);

    // Always show Android notification first
    if (isAndroid) {
      this.showAndroidNotification(title, message, sender);
    }

    // Also show web notification as fallback
    this.showWebNotification(title, message, {
      tag: `${sender}-${Date.now()}`,
      data: { type, sender }
    });

    // Optional: Console log for debugging
    console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
    console.log('=== END NOTIFICATION ===');
  },

  /**
   * Specific notification types
   */
  notifyNewMessage(senderName, messagePreview) {
    const title = `Message from ${senderName}`;
    const message = messagePreview.substring(0, 100) + (messagePreview.length > 100 ? '...' : '');
    this.notify(title, message, senderName, 'message');
  },

  notifyUserOnline(userName) {
    this.notify(`${userName} is online`, 'Now available to chat', userName, 'user-online');
  },

  notifyUserTyping(userName) {
    this.notify(`${userName} is typing`, 'Wait for the message...', userName, 'typing');
  },

  notifySuccess(message) {
    this.notify('Success', message, 'System', 'success');
  },

  notifyError(message) {
    this.notify('Error', message, 'System', 'error');
  }
};

export default NotificationHandler;
