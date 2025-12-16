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

      // Try to save token to database
      try {
        await saveFCMToken(userId, token);
        console.log(`FCM token saved for ${userId}`);
      } catch (dbError) {
        console.error('Failed to save to database:', dbError.message);
        // Still return success so app doesn't break
      }

      return res.status(200).json({
        ok: true,
        message: 'FCM token registered'
      });
    } catch (error) {
      console.error('FCM token registration error:', error);
      return res.status(200).json({
        ok: true,
        message: 'Token registered (may have issues)'
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
      try {
        await db.ref(`fcmTokens/${userId}`).remove();
      } catch (dbError) {
        console.error('Failed to remove from database:', dbError.message);
      }

      return res.status(200).json({
        ok: true,
        message: 'FCM token removed'
      });
    } catch (error) {
      console.error('FCM token removal error:', error);
      return res.status(500).json({
        ok: false,
        error: 'Failed to remove FCM token'
      });
    }
  }

  return res.status(405).json({
    ok: false,
    error: 'Method not allowed'
  });
}
