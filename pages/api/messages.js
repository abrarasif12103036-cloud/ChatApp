import connectDB from '@/lib/mongodb';
import Message from '@/lib/models/Message';

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
      const messages = await Message.find().sort({ createdAt: 1 }).lean();
      const formattedMessages = messages.map(msg => ({
        id: msg._id.toString(),
        sender: msg.sender,
        text: msg.text,
        image: msg.image,
        timestamp: msg.timestamp
      }));
      return res.status(200).json({ 
        ok: true,
        messages: formattedMessages,
        debug: { method }
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
      
      const newMessage = new Message({
        sender: body.sender || 'Unknown',
        text: body.text || '',
        image: body.image || null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      
      await newMessage.save();
      
      return res.status(201).json({ 
        ok: true,
        message: {
          id: newMessage._id.toString(),
          sender: newMessage.sender,
          text: newMessage.text,
          image: newMessage.image,
          timestamp: newMessage.timestamp
        },
        debug: { method }
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
      await Message.deleteMany({});
      return res.status(200).json({ 
        ok: true,
        message: 'Messages cleared',
        debug: { method }
      });
    } catch (error) {
      return res.status(500).json({ 
        ok: false,
        error: 'Failed to clear messages',
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
      allowed: ['GET', 'POST', 'DELETE']
    });
  }
}
