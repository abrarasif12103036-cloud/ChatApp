// In-memory storage for online users
const onlineUsers = new Map();

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  const method = req.method;
  
  if (method === 'POST') {
    // Mark user as online
    const { user } = req.body;
    if (user) {
      onlineUsers.set(user, {
        status: 'online',
        timestamp: Date.now()
      });
    }
    
    return res.status(200).json({
      ok: true,
      onlineUsers: Array.from(onlineUsers.keys())
    });
  }
  
  if (method === 'GET') {
    // Get list of online users
    const now = Date.now();
    
    // Remove users that haven't been seen for 5 seconds (offline)
    for (const [user, data] of onlineUsers.entries()) {
      if (now - data.timestamp > 5000) {
        onlineUsers.delete(user);
      }
    }
    
    return res.status(200).json({
      ok: true,
      onlineUsers: Array.from(onlineUsers.keys())
    });
  }
  
  if (method === 'DELETE') {
    // Mark user as offline
    const { user } = req.body;
    if (user) {
      onlineUsers.delete(user);
    }
    
    return res.status(200).json({
      ok: true,
      onlineUsers: Array.from(onlineUsers.keys())
    });
  }
  
  res.status(405).json({ error: 'Method not allowed' });
}
