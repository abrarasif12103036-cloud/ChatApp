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
    // Silently fail on file write errors
  }
}

// Initialize on module load
initializeCache();

async function handler(req, res) {
  try {
    const method = (req.method || '').toUpperCase();
    
    if (method === 'GET') {
      const messages = getMessages();
      return res.status(200).json(messages);
    } else if (method === 'POST') {
      const messages = getMessages();
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const newMessage = {
        id: Date.now(),
        sender: body.sender || 'Unknown',
        text: body.text || '',
        image: body.image || null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      messages.push(newMessage);
      setMessages(messages);
      return res.status(201).json(newMessage);
    } else if (method === 'DELETE') {
      setMessages([]);
      return res.status(200).json({ message: 'Messages cleared' });
    } else {
      return res.status(405).json({ error: 'Method not allowed', received: method });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = handler;
