let messages = [];

async function handler(req, res) {
  try {
    const method = req.method;
    
    if (method === 'GET') {
      return res.status(200).json(messages);
    } else if (method === 'POST') {
      const body = req.body || {};
      
      const newMessage = {
        id: Date.now(),
        sender: body.sender || 'Unknown',
        text: body.text || '',
        image: body.image || null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      messages.push(newMessage);
      return res.status(201).json(newMessage);
    } else if (method === 'DELETE') {
      messages = [];
      return res.status(200).json({ message: 'Messages cleared' });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = handler;
