import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import styles from '@/styles/chat.module.css';

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [otherUser, setOtherUser] = useState('');
  const [preview, setPreview] = useState('');
  const [enlargedImage, setEnlargedImage] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesAreaRef = useRef(null);
  const fileInputRef = useRef(null);
  const isUserScrolling = useRef(false);

  const scrollToBottom = () => {
    if (!isUserScrolling.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    const element = messagesAreaRef.current;
    if (!element) return;
    
    // Check if user is near the bottom (within 100px)
    const isNearBottom = 
      element.scrollHeight - element.scrollTop - element.clientHeight < 100;
    
    isUserScrolling.current = !isNearBottom;
  };

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (!user) {
      router.push('/');
      return;
    }
    setCurrentUser(user);
    setOtherUser(user === 'Abrar' ? 'Mohona' : 'Abrar');

    // Load existing messages from API
    const loadMessages = async () => {
      try {
        const res = await fetch('/api/messages');
        const data = await res.json();
        setMessages(data);
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    loadMessages();

    // Auto-refresh every 500ms
    const interval = setInterval(() => {
      fetch('/api/messages')
        .then(res => res.json())
        .then(data => {
          setMessages((prevMessages) => {
            // Only update if the count changed
            if (data.length !== prevMessages.length) {
              return data;
            }
            return prevMessages;
          });
        })
        .catch(error => console.error('Failed to fetch messages:', error));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() && !preview) return;

    const newMessage = {
      sender: currentUser,
      text: inputValue || '📷 Image',
      image: preview || null
    };

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage)
      });

      if (res.ok) {
        // Reload messages
        const messagesRes = await fetch('/api/messages');
        const updatedMessages = await messagesRes.json();
        setMessages(updatedMessages);
        setInputValue('');
        setPreview('');
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    router.push('/');
  };

  const clearChat = async () => {
    if (confirm('Clear all messages?')) {
      try {
        await fetch('/api/messages', { method: 'DELETE' });
        setMessages([]);
      } catch (error) {
        console.error('Failed to clear messages:', error);
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>💬 Chat - {currentUser.charAt(0).toUpperCase() + currentUser.slice(1)}</h1>
        <div className={styles.buttons}>
          <button onClick={clearChat} className={styles.btnSecondary}>Clear</button>
          <button onClick={handleLogout} className={styles.btnLogout}>Logout</button>
        </div>
      </div>

      <div className={styles.messagesArea}>
        {messages.length === 0 ? (
          <div className={styles.empty}>
            <p>📭 No messages yet. Start chatting!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`${styles.message} ${msg.sender === currentUser ? styles.own : styles.other}`}>
              <div className={styles.bubble}>
                {msg.image && (
                  <img 
                    src={msg.image} 
                    alt="shared" 
                    className={styles.image}
                    onClick={() => setEnlargedImage(msg.image)}
                    style={{ cursor: 'pointer' }}
                  />
                )}
                {msg.text !== '📷 Image' && <p className={styles.text}>{msg.text}</p>}
                <span className={styles.time}>{msg.timestamp}</span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {enlargedImage && (
        <div className={styles.modal} onClick={() => setEnlargedImage(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button 
              className={styles.closeBtn}
              onClick={() => setEnlargedImage(null)}
            >
              ✕
            </button>
            <img src={enlargedImage} alt="enlarged" className={styles.enlargedImage} />
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className={styles.inputArea}>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className={styles.fileInput}
          ref={fileInputRef}
        />
        <button type="button" onClick={() => fileInputRef.current?.click()} className={styles.imgBtn} title="Add image">
          +
        </button>
        
        {preview && (
          <div className={styles.previewContainer}>
            <img src={preview} alt="preview" className={styles.previewImg} />
            <button
              type="button"
              onClick={() => {
                setPreview('');
                fileInputRef.current.value = '';
              }}
              className={styles.removePreview}
            >
              ✕
            </button>
          </div>
        )}
        
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type a message..."
          className={styles.inputField}
        />
        <button type="submit" className={styles.sendBtn}>Send</button>
      </form>
    </div>
  );
}
