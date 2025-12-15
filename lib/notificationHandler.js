/**
 * Notification Handler Utility
 * Handles notifications for both web and Android app
 */

export const NotificationHandler = {
  /**
   * Show notification on Android app
   * Uses JavaScript bridge to native Android notification system
   */
  showAndroidNotification(title, message, sender) {
    if (window.AndroidNotification) {
      try {
        window.AndroidNotification.showNotification(title, message, sender);
      } catch (error) {
        console.warn('Android notification failed:', error);
      }
    }
  },

  /**
   * Show web notification (works on both web and Android browsers)
   */
  showWebNotification(title, message, options = {}) {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body: message,
          icon: '/icon.png',
          badge: '/badge.png',
          ...options
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(title, {
              body: message,
              icon: '/icon.png',
              badge: '/badge.png',
              ...options
            });
          }
        });
      }
    }
  },

  /**
   * Unified notification function - shows both Android native and web notifications
   */
  notify(title, message, sender, type = 'message') {
    const isAndroid = window.AndroidNotification !== undefined;

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
