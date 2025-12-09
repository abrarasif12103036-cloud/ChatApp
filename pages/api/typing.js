// In-memory storage for typing users
const typingUsers = new Map();

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  const method = req.method;
  
  if (method === 'POST') {
    // Mark user as typing
    const { user, isTyping } = req.body;
    
    if (isTyping) {
      typingUsers.set(user, {
        typing: true,
        timestamp: Date.now()
      });
    } else {
      typingUsers.delete(user);
    }
    
    return res.status(200).json({
      ok: true,
      typingUsers: Array.from(typingUsers.keys())
    });
  }
  
  if (method === 'GET') {
    // Get list of typing users
    const now = Date.now();
    
    // Remove users that haven't been seen for 3 seconds (stopped typing)
    for (const [user, data] of typingUsers.entries()) {
      if (now - data.timestamp > 3000) {
        typingUsers.delete(user);
      }
    }
    
    return res.status(200).json({
      ok: true,
      typingUsers: Array.from(typingUsers.keys())
    });
  }
  
  res.status(405).json({ error: 'Method not allowed' });
}
