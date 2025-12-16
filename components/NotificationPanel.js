import { useEffect, useState } from 'react';
import styles from '@/styles/notifications.module.css';

export default function NotificationPanel({ currentUser }) {
  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!currentUser) return;

    // Fetch notifications
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`/api/notifications?user=${currentUser}`);
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();

    // Poll every 2 seconds
    const interval = setInterval(fetchNotifications, 2000);

    return () => clearInterval(interval);
  }, [currentUser]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser, notificationId })
      });

      // Update local state
      setNotifications(
        notifications.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <div className={styles.notificationContainer}>
      {/* Notification Bell Icon */}
      <button
        className={styles.bellIcon}
        onClick={() => setShowPanel(!showPanel)}
        title={`${unreadCount} new notifications`}
      >
        🔔
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <div className={styles.panel}>
          <div className={styles.header}>
            <h3>Notifications</h3>
            <button
              className={styles.closeBtn}
              onClick={() => setShowPanel(false)}
            >
              ✕
            </button>
          </div>

          <div className={styles.notificationsList}>
            {notifications.length === 0 ? (
              <div className={styles.empty}>
                <p>✨ No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`${styles.notificationItem} ${
                    notification.read ? '' : styles.unread
                  }`}
                  onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                >
                  <div className={styles.notificationContent}>
                    <p className={styles.sender}>
                      {notification.senderUser}
                    </p>
                    <p className={styles.message}>
                      {notification.message}
                    </p>
                    <span className={styles.time}>
                      {new Date(notification.timestamp).toLocaleTimeString('en-BD', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true,
                        timeZone: 'Asia/Dhaka'
                      })}
                    </span>
                  </div>
                  {!notification.read && (
                    <div className={styles.unreadDot}></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
