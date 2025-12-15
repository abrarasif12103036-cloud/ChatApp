import connectDB from '../../lib/mongodb';
import Message from '../../lib/models/Message';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  try {
    await connectDB();
  } catch (error) {
    return res.status(500).json({ 
      ok: false,
      error: 'Database connection failed',
      details: error.message
    });
  }

  const method = req.method;
  
  if (method === 'GET') {
    try {
      const messages = await Message.find().sort({ createdAt: 1 });
      return res.status(200).json({ 
        ok: true,
        messages: messages.map(msg => ({
          id: msg._id,
          sender: msg.sender,
          text: msg.text,
          image: msg.image,
          timestamp: msg.timestamp,
          isRead: msg.isRead,
          replyTo: msg.replyTo,
          reactions: msg.reactions || {},
          isDeleted: msg.isDeleted || false
        }))
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
      
      const messageData = {
        sender: body.sender || 'Unknown',
        text: body.text || '',
        image: body.image || null,
        timestamp: new Date().toISOString(),
        replyTo: body.replyTo || null
      };
      
      const newMessage = new Message(messageData);
      await newMessage.save();
      
      return res.status(201).json({ 
        ok: true,
        message: {
          id: newMessage._id,
          sender: newMessage.sender,
          text: newMessage.text,
          image: newMessage.image,
          timestamp: newMessage.timestamp,
          isRead: newMessage.isRead,
          replyTo: newMessage.replyTo,
          reactions: newMessage.reactions || {},
          isDeleted: newMessage.isDeleted || false
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
      const { messageId, user } = req.body;
      
      console.log('DELETE request received:', { messageId, user });
      
      if (!messageId) {
        return res.status(400).json({ 
          ok: false,
          error: 'messageId is required'
        });
      }
      
      // Find the message to verify ownership
      const message = await Message.findById(messageId);
      
      console.log('Message found:', { id: message?._id, sender: message?.sender, user });
      
      if (!message) {
        return res.status(404).json({ 
          ok: false,
          error: 'Message not found'
        });
      }
      
      // Verify the user owns this message
      if (message.sender !== user) {
        console.log('Ownership check failed:', { messageSender: message.sender, requestUser: user });
        return res.status(403).json({ 
          ok: false,
          error: 'You can only delete your own messages'
        });
      }
      
      // Mark the message as deleted instead of removing it
      const updatedMessage = await Message.findByIdAndUpdate(
        messageId,
        { isDeleted: true },
        { new: true }
      );
      
      console.log('Message marked as deleted:', updatedMessage._id);
      
      return res.status(200).json({ 
        ok: true,
        message: 'Message deleted successfully',
        updatedMessage: {
          id: updatedMessage._id,
          sender: updatedMessage.sender,
          text: updatedMessage.text,
          image: updatedMessage.image,
          timestamp: updatedMessage.timestamp,
          isRead: updatedMessage.isRead,
          replyTo: updatedMessage.replyTo,
          reactions: updatedMessage.reactions || {},
          isDeleted: updatedMessage.isDeleted
        }
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
    // Mark messages as read
    try {
      const { recipientUser } = req.body;
      
      await Message.updateMany(
        { sender: { $ne: recipientUser }, isRead: false },
        { isRead: true }
      );
      
      const messages = await Message.find().sort({ createdAt: 1 });
      return res.status(200).json({ 
        ok: true,
        messages: messages.map(msg => ({
          id: msg._id,
          sender: msg.sender,
          text: msg.text,
          image: msg.image,
          replyTo: msg.replyTo || null,
          timestamp: msg.timestamp,
          isRead: msg.isRead,
          reactions: msg.reactions || {},
          isDeleted: msg.isDeleted || false
        }))
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
      error: 'Method not allowed',
      received: method,
      allowed: ['GET', 'POST', 'DELETE', 'PUT']
    });
  }
}
