import db from '@/lib/firebase';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  const method = req.method;
  
  try {
    if (method === 'POST') {
      // Mark user as typing
      const { user, isTyping } = req.body;
      
      if (isTyping) {
        await db.ref(`typingUsers/${user}`).set({
          user,
          isTyping: true,
          lastUpdate: new Date().toISOString()
        });
      } else {
        await db.ref(`typingUsers/${user}`).remove();
      }
      
      const snapshot = await db.ref('typingUsers').once('value');
      const typingUsersObj = snapshot.val() || {};
      const typingUsers = Object.keys(typingUsersObj);
      
      return res.status(200).json({
        ok: true,
        typingUsers
      });
    }
    
    if (method === 'GET') {
      // Get list of typing users
      const now = Date.now();
      const threeSecondsAgo = now - 3000;
      
      const snapshot = await db.ref('typingUsers').once('value');
      const typingUsersObj = snapshot.val() || {};
      
      // Remove users that haven't been updated in 3 seconds (stopped typing)
      Object.entries(typingUsersObj).forEach(async ([user, data]) => {
        const lastUpdate = new Date(data.lastUpdate).getTime();
        if (lastUpdate < threeSecondsAgo) {
          await db.ref(`typingUsers/${user}`).remove();
        }
      });
      
      const updatedSnapshot = await db.ref('typingUsers').once('value');
      const updatedTypingUsersObj = updatedSnapshot.val() || {};
      const typingUsers = Object.keys(updatedTypingUsersObj);
      
      return res.status(200).json({
        ok: true,
        typingUsers
      });
    }
    
    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Typing API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
