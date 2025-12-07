const fs = require('fs');
const path = require('path');

// In-memory storage as primary
let messagesCache = [];
const messagesFile = path.join(process.cwd(), 'data', 'messages.json');

// Initialize cache from file if it exists
function initializeCache() {
  try {
    const dataDir = path.dirname(messagesFile);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (fs.existsSync(messagesFile)) {
      const data = fs.readFileSync(messagesFile, 'utf-8');
      messagesCache = JSON.parse(data);
    }
  } catch (error) {
    console.error('Error initializing cache:', error);
    messagesCache = [];
  }
}

// Load messages from cache
function getMessages() {
  return messagesCache;
}

// Save messages to both cache and file (for dev mode persistence)
function setMessages(messages) {
  messagesCache = messages;
  try {
    if (process.env.NODE_ENV === 'development') {
      const dataDir = path.dirname(messagesFile);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2), 'utf-8');
    }
  } catch (error) {
    console.error('Error saving messages:', error);
  }
}

// Initialize on module load
initializeCache();

function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // Get all messages
      const messages = getMessages();
      return res.status(200).json(messages);
    } else if (req.method === 'POST') {
      // Add new message
      const messages = getMessages();
      const newMessage = {
        id: Date.now(),
        sender: req.body.sender,
        text: req.body.text,
        image: req.body.image || null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      messages.push(newMessage);
      setMessages(messages);
      return res.status(201).json(newMessage);
    } else if (req.method === 'DELETE') {
      // Clear all messages
      setMessages([]);
      return res.status(200).json({ message: 'Messages cleared' });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = handler;
