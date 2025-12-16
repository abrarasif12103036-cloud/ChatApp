import db from '@/lib/firebase';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  const method = req.method;
  
  try {
    if (method === 'POST') {
      // Mark user as online
      const { user } = req.body;
      if (user) {
        await db.ref(`onlineUsers/${user}`).set({
          user,
          status: 'online',
          lastUpdate: new Date().toISOString()
        });
      }
      
      const snapshot = await db.ref('onlineUsers').once('value');
      const onlineUsersObj = snapshot.val() || {};
      const onlineUsers = Object.keys(onlineUsersObj);
      
      return res.status(200).json({
        ok: true,
        onlineUsers
      });
    }
    
    if (method === 'GET') {
      // Get list of online users
      const now = Date.now();
      const fiveSecondsAgo = now - 5000;
      
      const snapshot = await db.ref('onlineUsers').once('value');
      const onlineUsersObj = snapshot.val() || {};
      
      // Remove users that haven't been updated in 5 seconds
      Object.entries(onlineUsersObj).forEach(async ([user, data]) => {
        const lastUpdate = new Date(data.lastUpdate).getTime();
        if (lastUpdate < fiveSecondsAgo) {
          await db.ref(`onlineUsers/${user}`).remove();
        }
      });
      
      const updatedSnapshot = await db.ref('onlineUsers').once('value');
      const updatedOnlineUsersObj = updatedSnapshot.val() || {};
      const onlineUsers = Object.keys(updatedOnlineUsersObj);
      
      return res.status(200).json({
        ok: true,
        onlineUsers
      });
    }
    
    if (method === 'DELETE') {
      // Mark user as offline
      const { user } = req.body;
      if (user) {
        await db.ref(`onlineUsers/${user}`).remove();
      }
      
      const snapshot = await db.ref('onlineUsers').once('value');
      const onlineUsersObj = snapshot.val() || {};
      const onlineUsers = Object.keys(onlineUsersObj);
      
      return res.status(200).json({
        ok: true,
        onlineUsers
      });
    }
    
    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Online API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
