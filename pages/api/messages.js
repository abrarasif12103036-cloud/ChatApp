let messages = [];

async function handler(req, res) {
  try {
    // Normalize method - handle edge cases
    const method = (req.method || '').toUpperCase().trim();
    
    if (method === 'GET') {
      return res.status(200).json({ messages, debug: { method } });
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
      return res.status(201).json({ message: newMessage, debug: { method } });
    } else if (method === 'DELETE') {
      messages = [];
      return res.status(200).json({ message: 'Messages cleared', debug: { method } });
    } else if (method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // Log what we received
    return res.status(405).json({ 
      error: 'Method not allowed',
      received: method,
      expected: ['GET', 'POST', 'DELETE']
    });
  } catch (error) {
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
}

module.exports = handler;
