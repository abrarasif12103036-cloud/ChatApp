import db from '../../lib/firebase';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'POST') {
    try {
      const { recipientUser, senderUser, message, type } = req.body;

      if (!recipientUser || !senderUser || !message) {
        return res.status(400).json({
          ok: false,
          error: 'Missing required fields'
        });
      }

      // Save notification to database
      const notificationId = Date.now().toString();
      const notificationData = {
        id: notificationId,
        recipientUser,
        senderUser,
        message,
        type: type || 'message', // message, typing, online, reaction
        timestamp: new Date().toISOString(),
        read: false
      };

      await db.ref(`notifications/${recipientUser}/${notificationId}`).set(notificationData);

      // Store in notifications collection for history
      await db.ref(`allNotifications/${notificationId}`).set(notificationData);

      return res.status(200).json({
        ok: true,
        notification: notificationData
      });
    } catch (error) {
      console.error('Notification error:', error);
      return res.status(500).json({
        ok: false,
        error: 'Failed to send notification',
        details: error.message
      });
    }
  }

  if (req.method === 'GET') {
    try {
      const { user } = req.query;

      if (!user) {
        return res.status(400).json({
          ok: false,
          error: 'User parameter required'
        });
      }

      const snapshot = await db.ref(`notifications/${user}`).once('value');
      const notificationsObj = snapshot.val() || {};

      const notifications = Object.values(notificationsObj).sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      return res.status(200).json({
        ok: true,
        notifications,
        unreadCount: notifications.filter(n => !n.read).length
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        error: 'Failed to fetch notifications',
        details: error.message
      });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { user, notificationId } = req.body;

      if (!user || !notificationId) {
        return res.status(400).json({
          ok: false,
          error: 'User and notificationId required'
        });
      }

      // Mark as read
      await db.ref(`notifications/${user}/${notificationId}/read`).set(true);

      return res.status(200).json({
        ok: true,
        message: 'Notification marked as read'
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        error: 'Failed to update notification',
        details: error.message
      });
    }
  }

  return res.status(405).json({
    ok: false,
    error: 'Method not allowed'
  });
}
