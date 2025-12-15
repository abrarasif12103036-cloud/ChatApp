import { useState, useEffect } from 'react';
import styles from '@/styles/notification-panel.module.css';

export default function NotificationPanel({ notifications = [], onDismiss, onClear }) {
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  useEffect(() => {
    setVisibleNotifications(notifications);
  }, [notifications]);

  const handleDismiss = (id) => {
    setVisibleNotifications(prev => prev.filter(notif => notif.id !== id));
    if (onDismiss) onDismiss(id);
  };

  const handleClearAll = () => {
    setVisibleNotifications([]);
    if (onClear) onClear();
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          Notifications ({visibleNotifications.length})
        </h3>
        <button 
          className={styles.clearBtn}
          onClick={handleClearAll}
          title="Clear all notifications"
        >
          Clear All
        </button>
      </div>

      <div className={styles.notificationsList}>
        {visibleNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`${styles.notification} ${styles[notification.type]}`}
          >
            <div className={styles.icon}>
              {getNotificationIcon(notification.type)}
            </div>
            <div className={styles.content}>
              <p className={styles.message}>{notification.message}</p>
              {notification.timestamp && (
                <span className={styles.timestamp}>
                  {formatTime(notification.timestamp)}
                </span>
              )}
            </div>
            <button
              className={styles.closeBtn}
              onClick={() => handleDismiss(notification.id)}
              title="Dismiss notification"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function getNotificationIcon(type) {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
    message: '💬',
    user: '👤',
    typing: '✎'
  };
  return icons[type] || 'ℹ';
}

function formatTime(timestamp) {
  if (!timestamp) return '';
  const now = new Date();
  const notifTime = new Date(timestamp);
  const diffMs = now - notifTime;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  return notifTime.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
