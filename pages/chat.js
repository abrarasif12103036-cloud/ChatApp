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
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const messagesAreaRef = useRef(null);
  const fileInputRef = useRef(null);
  const isUserScrolling = useRef(false);
  const typingTimeoutRef = useRef(null);

  // Format timestamp to local timezone
  const formatTime = (isoTimestamp) => {
    if (!isoTimestamp) return '';
    const date = new Date(isoTimestamp);
    return date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

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

  // Mark messages as read when user comes online
  const markMessagesAsRead = async (user) => {
    try {
      const res = await fetch('/api/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientUser: user })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  // Update online status
  const updateOnlineStatus = async (user) => {
    try {
      const res = await fetch('/api/online', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user })
      });

      if (res.ok) {
        const data = await res.json();
        setOnlineUsers(data.onlineUsers || []);
      }
    } catch (error) {
      console.error('Failed to update online status:', error);
    }
  };

  // Handle typing indicator
  const handleTyping = async (typing) => {
    if (isTyping === typing) return;
    
    setIsTyping(typing);
    
    try {
      await fetch('/api/typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser, isTyping: typing })
      });
    } catch (error) {
      console.error('Failed to update typing status:', error);
    }
  };

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    console.log('Initializing chat, user:', user);
    if (!user) {
      console.log('No user found, redirecting to login');
      router.push('/');
      return;
    }
    setCurrentUser(user);
    setOtherUser(user === 'Abrar' ? 'Mohona' : 'Abrar');
    setIsLoading(false);

    // Load existing messages from API
    const loadMessages = async () => {
      try {
        const res = await fetch('/api/messages');
        const data = await res.json();
        console.log('Loaded messages:', data);
        setMessages(data.messages || []);
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    loadMessages();

    // Update online status immediately
    updateOnlineStatus(user);

    // Auto-refresh messages, typing status, and online status every 500ms
    let lastMessageCount = 0;
    const interval = setInterval(() => {
      // Fetch messages
      fetch('/api/messages')
        .then(res => res.json())
        .then(data => {
          const messagesList = data.messages || [];
          setMessages(messagesList);
          lastMessageCount = messagesList.length;
          
          // Mark unread messages from other user as read
          const unreadMessages = messagesList.filter(msg => msg.sender !== user && !msg.isRead);
          if (unreadMessages.length > 0) {
            markMessagesAsRead(user);
          }
        })
        .catch(error => console.error('Failed to fetch messages:', error));

      // Fetch typing status
      fetch('/api/typing')
        .then(res => res.json())
        .then(data => {
          const typingUsersList = data.typingUsers || [];
          const otherIsTyping = typingUsersList.includes(user === 'Abrar' ? 'Mohona' : 'Abrar');
          setOtherUserTyping(otherIsTyping);
        })
        .catch(error => console.error('Failed to fetch typing status:', error));

      // Update online status
      updateOnlineStatus(user);
    }, 500);

    // Handle window unload to mark user as offline
    const handleBeforeUnload = async () => {
      try {
        await fetch('/api/online', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user })
        });
      } catch (error) {
        console.error('Failed to mark user offline:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      handleBeforeUnload();
    };
  }, [router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, otherUserTyping]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    
    // Handle typing indicator
    handleTyping(true);
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      handleTyping(false);
    }, 1000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    // Stop typing indicator
    handleTyping(false);
    
    // Ensure currentUser is set
    if (!currentUser) {
      alert('User not loaded. Please refresh the page.');
      return;
    }
    
    if (!inputValue.trim() && !preview) {
      return;
    }

    try {
      const newMessage = {
        sender: currentUser,
        text: inputValue || '📷 Image',
        image: preview || null
      };

      console.log('Sending message:', newMessage);
      
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage)
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        console.error('API Error Response:', errorBody);
        throw new Error(`API error: ${res.status}`);
      }

      console.log('Message sent successfully');
      
      // Clear input immediately
      setInputValue('');
      setPreview('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      // Reload messages from API
      const messagesRes = await fetch('/api/messages');
      if (messagesRes.ok) {
        const data = await messagesRes.json();
        console.log('Updated messages:', data);
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message: ' + error.message);
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

  const isOtherUserOnline = onlineUsers.includes(otherUser);

  if (!currentUser) {
    return <div className={styles.container}><div style={{ color: '#00d4ff', textAlign: 'center', paddingTop: '50px' }}>Loading...</div></div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>💬 Chat - {currentUser.charAt(0).toUpperCase() + currentUser.slice(1)}</h1>
          <div className={styles.otherUserInfo}>
            <span className={styles.otherUserName}>{otherUser}</span>
            <div className={`${styles.statusIndicator} ${isOtherUserOnline ? styles.online : styles.offline}`} title={isOtherUserOnline ? 'Online' : 'Offline'}></div>
            <span className={styles.statusText}>{isOtherUserOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>
        <div className={styles.buttons}>
          <button onClick={clearChat} className={styles.btnSecondary}>Clear</button>
          <button onClick={handleLogout} className={styles.btnLogout}>Logout</button>
        </div>
      </div>

      <div className={styles.messagesArea} ref={messagesAreaRef} onScroll={handleScroll}>
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
                <div className={styles.messageFooter}>
                  <span className={styles.time}>{formatTime(msg.timestamp)}</span>
                  {msg.sender === currentUser && (
                    <span className={styles.readReceipt} title={msg.isRead ? 'Seen' : 'Sent'}>
                      {msg.isRead ? '✓✓' : '✓'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        
        {otherUserTyping && (
          <div className={`${styles.message} ${styles.other}`}>
            <div className={styles.bubble}>
              <div className={styles.typingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
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
          onChange={handleInputChange}
          placeholder="Type a message..."
          className={styles.inputField}
        />
        <button type="submit" className={styles.sendBtn}>Send</button>
      </form>
    </div>
  );
}

