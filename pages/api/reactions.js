import connectDB from '../../lib/mongodb';
import Message from '../../lib/models/Message';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  try {
    await connectDB();
  } catch (error) {
    return res.status(500).json({ 
      ok: false,
      error: 'Database connection failed',
      details: error.message
    });
  }

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

      const message = await Message.findById(messageId);
      if (!message) {
        return res.status(404).json({
          ok: false,
          error: 'Message not found'
        });
      }

      console.log('Message before changes:', { id: message._id, reactions: message.reactions });

      // Initialize reactions object if it doesn't exist
      if (!message.reactions) {
        message.reactions = {};
      }

      console.log('Current reactions before update:', message.reactions);

      // First, remove this user from ALL other emoji reactions
      Object.keys(message.reactions).forEach(emoji => {
        if (emoji !== reactionEmoji) {
          message.reactions[emoji] = message.reactions[emoji].filter(u => u !== user);
          if (message.reactions[emoji].length === 0) {
            delete message.reactions[emoji];
          }
        }
      });

      console.log('After removing user from other reactions:', message.reactions);

      // Get current reactions for this emoji - ensure it's an array
      const currentReactions = Array.isArray(message.reactions[reactionEmoji]) 
        ? message.reactions[reactionEmoji] 
        : [];

      console.log('Current reactions for emoji', reactionEmoji, ':', currentReactions);

      // Check if user already reacted with THIS emoji
      if (currentReactions.includes(user)) {
        // Remove reaction (toggle off)
        const filtered = currentReactions.filter(u => u !== user);
        if (filtered.length === 0) {
          delete message.reactions[reactionEmoji];
        } else {
          message.reactions[reactionEmoji] = filtered;
        }
      } else {
        // Add reaction (toggle on)
        message.reactions[reactionEmoji] = [...currentReactions, user];
      }

      console.log('Reactions before save:', JSON.stringify(message.reactions));
      // Mark reactions as modified for Mongoose
      message.markModified('reactions');
      
      const saveResult = await message.save();
      console.log('Save result:', { id: saveResult._id, reactions: saveResult.reactions });
      
      // Get updated message fresh from database
      const updatedMessage = await Message.findById(messageId);
      
      console.log('Fetched from DB after save:', { id: updatedMessage._id, reactions: updatedMessage.reactions });

      return res.status(200).json({
        ok: true,
        message: {
          id: updatedMessage._id,
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
