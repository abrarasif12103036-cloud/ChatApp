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
  const [replyingTo, setReplyingTo] = useState(null);
  const [showReactionPicker, setShowReactionPicker] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesAreaRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const isUserScrolling = useRef(false);
  const typingTimeoutRef = useRef(null);

  // Format timestamp to local timezone (GMT+6)
  const formatTime = (isoTimestamp) => {
    if (!isoTimestamp) return '';
    const date = new Date(isoTimestamp);
    return date.toLocaleString('en-BD', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'Asia/Dhaka'
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
        return data;
      }
    } catch (error) {
      // Silently ignore network errors
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
      // Silently ignore network errors - connection will be restored automatically
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
      // Silently ignore network errors - typing indicator is not critical
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
        console.log('Loaded messages from API:', JSON.stringify(data.messages, null, 2));
        setMessages(data.messages || []);
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    loadMessages();

    // Update online status immediately
    updateOnlineStatus(user);

    // Auto-refresh messages, typing status every 1000ms (reduced frequency to prevent blinking)
    let lastMessages = JSON.stringify([]);
    let lastTypingState = false;
    
    const interval = setInterval(() => {
      // Don't poll if user is not logged in
      if (!user) return;

      // Fetch messages
      fetch('/api/messages')
        .then(res => res.json())
        .then(data => {
          const messagesList = data.messages || [];
          const messagesStr = JSON.stringify(messagesList);
          
          // Only update if messages actually changed
          if (messagesStr !== lastMessages) {
            setMessages(messagesList);
            lastMessages = messagesStr;
          }
          
          // Mark unread messages from other user as read (do this silently without re-fetch)
          const unreadMessages = messagesList.filter(msg => msg.sender !== user && !msg.isRead);
          if (unreadMessages.length > 0) {
            markMessagesAsRead(user);
          }
        })
        .catch(() => {}); // Silently ignore network errors

      // Fetch typing status
      fetch('/api/typing')
        .then(res => res.json())
        .then(data => {
          const typingUsersList = data.typingUsers || [];
          const otherIsTyping = typingUsersList.includes(user === 'Abrar' ? 'Mohona' : 'Abrar');
          
          // Only update if typing state changed
          if (otherIsTyping !== lastTypingState) {
            setOtherUserTyping(otherIsTyping);
            lastTypingState = otherIsTyping;
          }
        })
        .catch(() => {}); // Silently ignore network errors
    }, 1000);

    // Update online status every 5 seconds (less frequent)
    const onlineInterval = setInterval(() => {
      if (user) updateOnlineStatus(user);
    }, 5000);

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
      clearInterval(onlineInterval);
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

  const handleReaction = async (messageId, reaction) => {
    try {
      console.log('handleReaction called:', { messageId, reaction, user: currentUser });
      
      const res = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: messageId.toString(),
          user: currentUser,
          reaction
        })
      });

      console.log('Reaction response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('Reaction response data:', data);
        console.log('Message from response:', data.message);
        console.log('Reactions in response:', data.message?.reactions);
        
        if (data.ok && data.message) {
          setMessages(messages.map(msg =>
            msg.id.toString() === messageId.toString() ? data.message : msg
          ));
          // Force a log of updated messages
          setTimeout(() => {
            console.log('Messages after update:', messages);
          }, 100);
        }
      } else {
        const error = await res.json();
        console.error('Reaction error:', error);
      }
    } catch (error) {
      console.error('Reaction exception:', error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      if (!currentUser) {
        alert('User not loaded. Please refresh the page.');
        return;
      }

      const confirmDelete = window.confirm('Are you sure you want to delete this message?');
      if (!confirmDelete) return;

      console.log('Deleting message:', { messageId, currentUser });

      const res = await fetch('/api/messages', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: messageId.toString(),
          user: currentUser
        })
      });

      console.log('Delete response status:', res.status);

      if (res.ok) {
        const data = await res.json();
        console.log('Delete successful:', data);
        // Mark message as deleted in local state
        setMessages(messages.map(msg => 
          msg.id.toString() === messageId.toString() 
            ? { ...msg, isDeleted: true, text: 'This message was deleted' }
            : msg
        ));
        setShowReactionPicker(null);
      } else {
        const error = await res.json();
        console.error('Delete failed:', error);
        alert('Failed to delete message: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
      alert('Error deleting message');
    }
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
        image: preview || null,
        replyTo: replyingTo ? {
          sender: replyingTo.sender,
          text: replyingTo.text,
          image: replyingTo.image
        } : null
      };

      console.log('Sending message with replyTo:', newMessage);
      
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
      
      // Clear input and reply
      setInputValue('');
      setPreview('');
      setReplyingTo(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      // Reload messages from API
      const messagesRes = await fetch('/api/messages');
      if (messagesRes.ok) {
        const data = await messagesRes.json();
        console.log('All messages from API:', JSON.stringify(data.messages, null, 2));
        data.messages.forEach((msg, idx) => {
          console.log(`Message ${idx}:`, {
            sender: msg.sender,
            text: msg.text,
            hasReplyTo: !!msg.replyTo,
            replyTo: msg.replyTo
          });
        });
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message: ' + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      // First, mark user as offline
      await fetch('/api/online', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user })
      });
    } catch (error) {
      console.error('Failed to mark user offline during logout:', error);
    }
    
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

  const handleReload = () => {
    window.location.reload();
  };

  const isOtherUserOnline = onlineUsers.includes(otherUser);

  if (!currentUser) {
    return <div className={styles.container}><div style={{ color: '#00d4ff', textAlign: 'center', paddingTop: '50px' }}>Loading...</div></div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.otherUserInfo}>
            <span className={styles.otherUserName}>{otherUser}</span>
            {isOtherUserOnline && (
              <>
                <div className={`${styles.statusIndicator} ${styles.online}`} title="Online"></div>
                <span className={styles.statusText}>Online</span>
              </>
            )}
          </div>
        </div>
        <div className={styles.buttons}>
          <button onClick={clearChat} className={styles.btnSecondary}>Clear</button>
          <button onClick={handleReload} className={styles.btnReload} title="Reload messages">↻</button>
          <button onClick={handleLogout} className={styles.btnLogout}>Logout</button>
        </div>
      </div>

      <div 
        className={styles.messagesArea} 
        ref={messagesAreaRef} 
        onScroll={handleScroll}
        onClick={() => setShowReactionPicker(null)}
      >
        {messages.length === 0 ? (
          <div className={styles.empty}>
            <p>📭 No messages yet. Start chatting!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} data-message-id={msg.id.toString()} className={`${styles.message} ${msg.sender === currentUser ? styles.own : styles.other}`}>
              {msg.sender === currentUser && (
                <div className={styles.messageMenuContainer}>
                  <button
                    type="button"
                    className={styles.menuButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowReactionPicker(showReactionPicker === msg.id ? null : msg.id);
                    }}
                    title="More options"
                  >
                    ...
                  </button>
                  {showReactionPicker === msg.id && (
                    <div 
                      className={`${styles.actionMenu} ${styles.leftMenu}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button 
                        type="button"
                        className={styles.replyAction}
                        onClick={() => {
                          setReplyingTo(msg);
                          setShowReactionPicker(null);
                          setTimeout(() => inputRef.current?.focus(), 0);
                        }}
                        title="Reply to this message"
                      >
                        ↩ Reply
                      </button>
                      <button 
                        type="button"
                        className={styles.deleteAction}
                        onClick={() => {
                          handleDeleteMessage(msg.id);
                        }}
                        title="Delete this message"
                      >
                        Delete
                      </button>
                      <div className={styles.reactionPicker}>
                        <button
                          type="button"
                          className={styles.reactionOption}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleReaction(msg.id, 'Black Love');
                            setShowReactionPicker(null);
                          }}
                          title="Black Love"
                        >
                          🖤
                        </button>
                        <button
                          type="button"
                          className={styles.reactionOption}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleReaction(msg.id, 'Haha');
                            setShowReactionPicker(null);
                          }}
                          title="Haha"
                        >
                          😂
                        </button>
                        <button
                          type="button"
                          className={styles.reactionOption}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleReaction(msg.id, 'Sad');
                            setShowReactionPicker(null);
                          }}
                          title="Sad"
                        >
                          😢
                        </button>
                        <button
                          type="button"
                          className={styles.reactionOption}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleReaction(msg.id, 'Like');
                            setShowReactionPicker(null);
                          }}
                          title="Like"
                        >
                          👍
                        </button>
                        <button
                          type="button"
                          className={styles.reactionOption}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleReaction(msg.id, 'Unlike');
                            setShowReactionPicker(null);
                          }}
                          title="Unlike"
                        >
                          👎
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className={styles.bubble}>
                {msg.replyTo && msg.replyTo.sender && (
                  <div 
                    className={styles.replyReference}
                    onClick={() => {
                      // Find the original message by matching sender and text
                      const originalMsg = messages.find(m => 
                        m.sender === msg.replyTo.sender && m.text === msg.replyTo.text
                      );
                      if (originalMsg) {
                        const element = document.querySelector(`[data-message-id="${originalMsg.id.toString()}"]`);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={styles.replyQuote}>
                      <p className={styles.replyAuthor}>↳ {msg.replyTo.sender}</p>
                      {msg.replyTo.image && <img src={msg.replyTo.image} alt="reply" style={{ maxWidth: '60px', maxHeight: '60px', borderRadius: '4px', marginTop: '4px' }} />}
                      <p className={styles.replyText}>"{msg.replyTo.text}"</p>
                    </div>
                  </div>
                )}
                {msg.image && (
                  <img 
                    src={msg.image} 
                    alt="shared" 
                    className={styles.image}
                    onClick={() => setEnlargedImage(msg.image)}
                    style={{ cursor: 'pointer' }}
                  />
                )}
                {msg.text !== '📷 Image' && (
                  <p className={msg.isDeleted ? styles.deletedText : styles.text}>
                    {msg.isDeleted ? '(This message was deleted)' : msg.text}
                  </p>
                )}
                <div className={styles.messageFooter}>
                  <span className={styles.time}>{formatTime(msg.timestamp)}</span>
                  {msg.sender === currentUser && (
                    <span className={styles.readReceipt} title={msg.isRead ? 'Seen' : 'Sent'}>
                      {msg.isRead ? '✓✓' : '✓'}
                    </span>
                  )}
                </div>
                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                  <div className={styles.reactionsDisplay}>
                    {Object.entries(msg.reactions).map(([emoji, users]) => (
                      <div 
                        key={emoji} 
                        className={`${styles.reactionBadge} ${msg.sender === currentUser ? styles.reactionBadgeOwn : ''}`}
                        title={users.join(', ')}
                      >
                        <span>{emoji}</span>
                        <span className={`${styles.reactionCount} ${msg.sender === currentUser ? styles.reactionCountOwn : ''}`}>{users.length}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {msg.sender !== currentUser && (
                <div className={styles.messageMenuContainer}>
                  <button
                    type="button"
                    className={styles.menuButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowReactionPicker(showReactionPicker === msg.id ? null : msg.id);
                    }}
                    title="More options"
                  >
                    ...
                  </button>
                  {showReactionPicker === msg.id && (
                    <div 
                      className={`${styles.actionMenu} ${styles.rightMenu}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                    <button 
                      type="button"
                      className={styles.replyAction}
                      onClick={() => {
                        setReplyingTo(msg);
                        setShowReactionPicker(null);
                        setTimeout(() => inputRef.current?.focus(), 0);
                      }}
                      title="Reply to this message"
                    >
                      ↩ Reply
                    </button>
                    <div className={styles.reactionPicker}>
                      <button
                        type="button"
                        className={styles.reactionOption}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleReaction(msg.id, 'Black Love');
                          setShowReactionPicker(null);
                        }}
                        title="Black Love"
                      >
                        🖤
                      </button>
                      <button
                        type="button"
                        className={styles.reactionOption}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleReaction(msg.id, 'Haha');
                          setShowReactionPicker(null);
                        }}
                        title="Haha"
                      >
                        😂
                      </button>
                      <button
                        type="button"
                        className={styles.reactionOption}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleReaction(msg.id, 'Sad');
                          setShowReactionPicker(null);
                        }}
                        title="Sad"
                      >
                        😢
                      </button>
                      <button
                        type="button"
                        className={styles.reactionOption}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleReaction(msg.id, 'Like');
                          setShowReactionPicker(null);
                        }}
                        title="Like"
                      >
                        👍
                      </button>
                      <button
                        type="button"
                        className={styles.reactionOption}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleReaction(msg.id, 'Unlike');
                          setShowReactionPicker(null);
                        }}
                        title="Unlike"
                      >
                        👎
                      </button>
                    </div>
                  </div>
                )}
              </div>
              )}
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
        {replyingTo && (
          <div className={styles.replyingToContainer}>
            <div className={styles.replyingToPreview}>
              <p className={styles.replyingToLabel}>Replying to <strong>{replyingTo.sender}</strong></p>
              <p className={styles.replyingToText}>{replyingTo.text}</p>
            </div>
            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              className={styles.cancelReplyBtn}
              title="Cancel reply"
            >
              ✕
            </button>
          </div>
        )}
        
        <div className={styles.inputControls}>
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
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className={styles.inputField}
          />
          <button type="submit" className={styles.sendBtn}>Send</button>
        </div>
      </form>
    </div>
  );
}

