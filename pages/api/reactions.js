import db from '../../lib/firebase';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  const method = req.method;

  if (method === 'POST') {
    try {
      const { messageId, user, reaction } = req.body;

      console.log('Reaction request:', { messageId, user, reaction });

      if (!messageId || !user || !reaction) {
        return res.status(400).json({
          ok: false,
          error: 'Missing required fields: messageId, user, reaction'
        });
      }

      // Valid reactions
      const validReactions = ['🖤', '😂', '😢', '👍', '👎'];
      const reactionMap = {
        'Black Love': '🖤',
        'Haha': '😂',
        'Sad': '😢',
        'Like': '👍',
        'Unlike': '👎'
      };

      const reactionEmoji = reactionMap[reaction] || reaction;

      if (!validReactions.includes(reactionEmoji)) {
        return res.status(400).json({
          ok: false,
          error: 'Invalid reaction type'
        });
      }

      const snapshot = await db.ref(`messages/${messageId}`).once('value');
      const message = snapshot.val();

      if (!message) {
        return res.status(404).json({
          ok: false,
          error: 'Message not found'
        });
      }

      console.log('Message before changes:', { id: messageId, reactions: message.reactions });

      // Initialize reactions object if it doesn't exist
      let reactions = message.reactions || {};

      console.log('Current reactions before update:', reactions);

      // First, remove this user from ALL other emoji reactions
      Object.keys(reactions).forEach(emoji => {
        if (emoji !== reactionEmoji) {
          if (Array.isArray(reactions[emoji])) {
            reactions[emoji] = reactions[emoji].filter(u => u !== user);
            if (reactions[emoji].length === 0) {
              delete reactions[emoji];
            }
          }
        }
      });

      console.log('After removing user from other reactions:', reactions);

      // Get current reactions for this emoji - ensure it's an array
      const currentReactions = Array.isArray(reactions[reactionEmoji]) 
        ? reactions[reactionEmoji] 
        : [];

      console.log('Current reactions for emoji', reactionEmoji, ':', currentReactions);

      // Check if user already reacted with THIS emoji
      if (currentReactions.includes(user)) {
        // Remove reaction (toggle off)
        const filtered = currentReactions.filter(u => u !== user);
        if (filtered.length === 0) {
          delete reactions[reactionEmoji];
        } else {
          reactions[reactionEmoji] = filtered;
        }
      } else {
        // Add reaction (toggle on)
        reactions[reactionEmoji] = [...currentReactions, user];
      }

      console.log('Reactions before save:', JSON.stringify(reactions));

      await db.ref(`messages/${messageId}/reactions`).set(reactions);

      const updatedSnapshot = await db.ref(`messages/${messageId}`).once('value');
      const updatedMessage = updatedSnapshot.val();

      console.log('Fetched from DB after save:', { id: messageId, reactions: updatedMessage.reactions });

      return res.status(200).json({
        ok: true,
        message: {
          id: messageId,
          sender: updatedMessage.sender,
          text: updatedMessage.text,
          image: updatedMessage.image,
          timestamp: updatedMessage.timestamp,
          isRead: updatedMessage.isRead,
          replyTo: updatedMessage.replyTo,
          reactions: updatedMessage.reactions || {}
        }
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        error: 'Failed to add reaction',
        details: error.message
      });
    }
  } else {
    return res.status(405).json({
      ok: false,
      error: 'Method not allowed'
    });
  }
}
