let messages = [];

async function handler(req, res) {
  try {
    // Normalize method - handle edge cases
    const method = req.method ? String(req.method).toUpperCase().trim() : 'UNDEFINED';
    
    // Always include debug info in response
    const debugInfo = {
      receivedMethod: method,
      methodExists: Boolean(req.method),
      methodType: typeof req.method,
      methodRaw: req.method
    };
    
    if (method === 'GET') {
      return res.status(200).json({ 
        ok: true,
        messages,
        debug: debugInfo 
      });
    } 
    else if (method === 'POST') {
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
        debug: debugInfo 
      });
    } 
    else if (method === 'DELETE') {
      messages = [];
      return res.status(200).json({ 
        ok: true,
        message: 'Messages cleared',
        debug: debugInfo 
      });
    } 
    else if (method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // Unknown method
    return res.status(405).json({ 
      ok: false,
      error: 'Method not allowed',
      debug: debugInfo
    });
  } catch (error) {
    return res.status(500).json({ 
      ok: false,
      error: 'Internal server error',
      errorMessage: error.message
    });
  }
}

export default handler;
