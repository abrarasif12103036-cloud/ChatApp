import dbConnect from '@/lib/mongodb';
import TypingUser from '@/lib/models/TypingUser';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  const method = req.method;
  
  try {
    await dbConnect();
    
    if (method === 'POST') {
      // Mark user as typing
      const { user, isTyping } = req.body;
      
      if (isTyping) {
        await TypingUser.updateOne(
          { user },
          { user, isTyping: true, lastUpdate: new Date() },
          { upsert: true }
        );
      } else {
        await TypingUser.deleteOne({ user });
      }
      
      const typingUsers = await TypingUser.find({});
      return res.status(200).json({
        ok: true,
        typingUsers: typingUsers.map(u => u.user)
      });
    }
    
    if (method === 'GET') {
      // Get list of typing users
      const now = new Date();
      const threeSecondsAgo = new Date(now.getTime() - 3000);
      
      // Remove users that haven't been updated in 3 seconds (stopped typing)
      await TypingUser.deleteMany({ lastUpdate: { $lt: threeSecondsAgo } });
      
      const typingUsers = await TypingUser.find({});
      return res.status(200).json({
        ok: true,
        typingUsers: typingUsers.map(u => u.user)
      });
    }
    
    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Typing API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
