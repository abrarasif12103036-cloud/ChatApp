import fs from 'fs';
import path from 'path';

const messagesFile = path.join(process.cwd(), 'data', 'messages.json');

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.dirname(messagesFile);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Load messages from file
function loadMessages() {
  try {
    ensureDataDir();
    if (fs.existsSync(messagesFile)) {
      const data = fs.readFileSync(messagesFile, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading messages:', error);
  }
  return [];
}

// Save messages to file
function saveMessages(messages) {
  try {
    ensureDataDir();
    fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving messages:', error);
  }
}

export default function handler(req, res) {
  if (req.method === 'GET') {
    // Get all messages from file
    const messages = loadMessages();
    res.status(200).json(messages);
  } else if (req.method === 'POST') {
    // Add new message
    const messages = loadMessages();
    const newMessage = {
      id: Date.now(),
      sender: req.body.sender,
      text: req.body.text,
      image: req.body.image || null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    messages.push(newMessage);
    saveMessages(messages);
    res.status(201).json(newMessage);
  } else if (req.method === 'DELETE') {
    // Clear all messages
    saveMessages([]);
    res.status(200).json({ message: 'Messages cleared' });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
