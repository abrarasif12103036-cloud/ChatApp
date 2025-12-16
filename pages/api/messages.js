import db from '../../lib/firebase';
import { broadcastNotification } from '../../lib/notificationHandler';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  const method = req.method;
  
  if (method === 'GET') {
    try {
      const snapshot = await db.ref('messages').orderByChild('timestamp').once('value');
      const messagesObj = snapshot.val() || {};
      
      const messages = Object.entries(messagesObj).map(([id, msg]) => ({
        id,
        sender: msg.sender,
        text: msg.text,
        image: msg.image || null,
        timestamp: msg.timestamp,
        isRead: msg.isRead || false,
        replyTo: msg.replyTo || null,
        reactions: msg.reactions || {},
        isDeleted: msg.isDeleted || false
      }));
      
      return res.status(200).json({ 
        ok: true,
        messages
      });
    } catch (error) {
      return res.status(500).json({ 
        ok: false,
        error: 'Failed to fetch messages',
        details: error.message
      });
    }
  } 
  else if (method === 'POST') {
    try {
      const body = req.body || {};
      const messageId = Date.now().toString();
      
      const messageData = {
        sender: body.sender || 'Unknown',
        text: body.text || '',
        image: body.image || null,
        timestamp: new Date().toISOString(),
        replyTo: body.replyTo || null,
        isRead: false,
        reactions: {},
        isDeleted: false
      };
      
      await db.ref(`messages/${messageId}`).set(messageData);
      
      // Send push notification to all users
      if (body.text) {
        await broadcastNotification(body.sender || 'Unknown', body.text, body.sender);
      }
      
      return res.status(201).json({ 
        ok: true,
        message: {
          id: messageId,
          ...messageData
        }
      });
    } catch (error) {
      return res.status(500).json({ 
        ok: false,
        error: 'Failed to create message',
        details: error.message
      });
    }
  } 
  else if (method === 'DELETE') {
    try {
      const { messageId, user, clearAll } = req.body;
      
      if (clearAll === true) {
        console.log('CLEAR ALL request received');
        await db.ref('messages').remove();
        return res.status(200).json({ 
          ok: true,
          message: 'All messages cleared'
        });
      }
      
      if (!messageId) {
        return res.status(400).json({ 
          ok: false,
          error: 'messageId is required'
        });
      }
      
      const snapshot = await db.ref(`messages/${messageId}`).once('value');
      const message = snapshot.val();
      
      if (!message) {
        return res.status(404).json({ 
          ok: false,
          error: 'Message not found'
        });
      }
      
      if (message.sender !== user) {
        return res.status(403).json({ 
          ok: false,
          error: 'You can only delete your own messages'
        });
      }
      
      await db.ref(`messages/${messageId}`).remove();
      
      return res.status(200).json({ 
        ok: true,
        message: 'Message deleted successfully'
      });
    } catch (error) {
      console.error('DELETE error:', error);
      return res.status(500).json({ 
        ok: false,
        error: 'Failed to delete message',
        details: error.message
      });
    }
  } 
  else if (method === 'PUT') {
    try {
      const { recipientUser } = req.body;
      
      const snapshot = await db.ref('messages').once('value');
      const messagesObj = snapshot.val() || {};
      
      const updates = {};
      Object.entries(messagesObj).forEach(([id, msg]) => {
        if (msg.sender !== recipientUser && !msg.isRead) {
          updates[`messages/${id}/isRead`] = true;
        }
      });
      
      if (Object.keys(updates).length > 0) {
        await db.ref().update(updates);
      }
      
      const updatedSnapshot = await db.ref('messages').orderByChild('timestamp').once('value');
      const updatedMessagesObj = updatedSnapshot.val() || {};
      
      const messages = Object.entries(updatedMessagesObj).map(([id, msg]) => ({
        id,
        sender: msg.sender,
        text: msg.text,
        image: msg.image || null,
        timestamp: msg.timestamp,
        isRead: msg.isRead || false,
        replyTo: msg.replyTo || null,
        reactions: msg.reactions || {},
        isDeleted: msg.isDeleted || false
      }));
      
      return res.status(200).json({ 
        ok: true,
        messages
      });
    } catch (error) {
      return res.status(500).json({ 
        ok: false,
        error: 'Failed to mark messages as read',
        details: error.message
      });
    }
  }
  else if (method === 'OPTIONS') {
    return res.status(200).end();
  }
  else {
    return res.status(405).json({ 
      ok: false,
      error: 'Method not allowed'
    });
  }
}
