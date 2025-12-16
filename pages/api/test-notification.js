import { broadcastNotification } from '../../lib/notificationHandler';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');

  if (req.method === 'POST') {
    try {
      const { senderName, message } = req.body;

      if (!senderName || !message) {
        return res.status(400).json({
          ok: false,
          error: 'Missing senderName or message'
        });
      }

      // Broadcast notification to all devices
      await broadcastNotification(senderName, message);

      return res.status(200).json({
        ok: true,
        message: `Notification sent from ${senderName}`
      });
    } catch (error) {
      console.error('Test notification error:', error);
      return res.status(500).json({
        ok: false,
        error: 'Failed to send test notification',
        details: error.message
      });
    }
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      usage: 'POST with { senderName: "name", message: "text" } to send test notification'
    });
  }

  return res.status(405).json({
    ok: false,
    error: 'Method not allowed'
  });
}
