let messages = [];

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  const method = req.method;
  
  if (method === 'GET') {
    return res.status(200).json({ 
      ok: true,
      messages,
      debug: { method }
    });
  } 
  else if (method === 'POST') {
    try {
      const body = req.body || {};
      
      const newMessage = {
        id: Date.now(),
        sender: body.sender || 'Unknown',
        text: body.text || '',
        image: body.image || null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      messages.push(newMessage);
      return res.status(201).json({ 
        ok: true,
        message: newMessage,
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
    messages = [];
    return res.status(200).json({ 
      ok: true,
      message: 'Messages cleared',
      debug: { method }
    });
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
