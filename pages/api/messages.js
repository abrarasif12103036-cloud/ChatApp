// Simple in-memory message storage
let messages = [];

export default function handler(req, res) {
  if (req.method === 'GET') {
    // Get all messages
    res.status(200).json(messages);
  } else if (req.method === 'POST') {
    // Add new message
    const newMessage = {
      id: Date.now(),
      sender: req.body.sender,
      text: req.body.text,
      image: req.body.image || null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    messages.push(newMessage);
    res.status(201).json(newMessage);
  } else if (req.method === 'DELETE') {
    // Clear all messages
    messages = [];
    res.status(200).json({ message: 'Messages cleared' });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
