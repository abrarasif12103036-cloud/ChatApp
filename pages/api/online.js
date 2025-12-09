import dbConnect from '@/lib/mongodb';
import OnlineUser from '@/lib/models/OnlineUser';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  const method = req.method;
  
  try {
    await dbConnect();
    
    if (method === 'POST') {
      // Mark user as online
      const { user } = req.body;
      if (user) {
        await OnlineUser.updateOne(
          { user },
          { user, status: 'online', lastUpdate: new Date() },
          { upsert: true }
        );
      }
      
      const onlineUsers = await OnlineUser.find({});
      return res.status(200).json({
        ok: true,
        onlineUsers: onlineUsers.map(u => u.user)
      });
    }
    
    if (method === 'GET') {
      // Get list of online users
      const now = new Date();
      const fiveSecondsAgo = new Date(now.getTime() - 5000);
      
      // Remove users that haven't been updated in 5 seconds
      await OnlineUser.deleteMany({ lastUpdate: { $lt: fiveSecondsAgo } });
      
      const onlineUsers = await OnlineUser.find({});
      return res.status(200).json({
        ok: true,
        onlineUsers: onlineUsers.map(u => u.user)
      });
    }
    
    if (method === 'DELETE') {
      // Mark user as offline
      const { user } = req.body;
      if (user) {
        await OnlineUser.deleteOne({ user });
      }
      
      const onlineUsers = await OnlineUser.find({});
      return res.status(200).json({
        ok: true,
        onlineUsers: onlineUsers.map(u => u.user)
      });
    }
    
    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Online API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
