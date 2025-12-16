import db from '../../lib/firebase';
import { saveFCMToken } from '../../lib/notificationHandler';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'POST') {
    try {
      const { userId, token } = req.body;

      if (!userId || !token) {
        return res.status(400).json({
          ok: false,
          error: 'Missing userId or token'
        });
      }

      // Save token to database
      await saveFCMToken(userId, token);

      return res.status(200).json({
        ok: true,
        message: 'FCM token saved successfully'
      });
    } catch (error) {
      console.error('FCM token registration error:', error);
      return res.status(500).json({
        ok: false,
        error: 'Failed to save FCM token',
        details: error.message
      });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          ok: false,
          error: 'Missing userId'
        });
      }

      // Remove token from database
      await db.ref(`fcmTokens/${userId}`).remove();

      return res.status(200).json({
        ok: true,
        message: 'FCM token removed successfully'
      });
    } catch (error) {
      console.error('FCM token removal error:', error);
      return res.status(500).json({
        ok: false,
        error: 'Failed to remove FCM token',
        details: error.message
      });
    }
  }

  return res.status(405).json({
    ok: false,
    error: 'Method not allowed'
  });
}
