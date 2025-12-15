# How to Add Notification Panel to Your Chat App

## Overview
A notification panel displays real-time notifications for events like new messages, user typing, online status changes, etc. I've created a reusable `NotificationPanel` component that you can integrate into your chat page.

## Files Created

1. **`components/NotificationPanel.jsx`** - Main notification component
2. **`styles/notification-panel.module.css`** - Styling for the panel

## Installation Steps

### Step 1: Import the NotificationPanel Component
In your `pages/chat.js`, add this import at the top:

```javascript
import NotificationPanel from '@/components/NotificationPanel';
```

### Step 2: Add State for Managing Notifications
Add this to your state declarations in the ChatPage component:

```javascript
const [notifications, setNotifications] = useState([]);
```

### Step 3: Add Notification Management Functions
Add these helper functions in your ChatPage component:

```javascript
// Function to add a notification
const addNotification = (message, type = 'info', duration = 5000) => {
  const id = Date.now();
  const newNotification = {
    id,
    message,
    type,
    timestamp: new Date()
  };
  
  setNotifications(prev => [...prev, newNotification]);
  
  // Auto-remove notification after duration (optional)
  if (duration > 0) {
    setTimeout(() => removeNotification(id), duration);
  }
  
  return id;
};

// Function to remove a specific notification
const removeNotification = (id) => {
  setNotifications(prev => prev.filter(notif => notif.id !== id));
};

// Function to clear all notifications
const clearAllNotifications = () => {
  setNotifications([]);
};
```

### Step 4: Render the Component
Add this to your JSX return statement (in the header area is recommended):

```javascript
<NotificationPanel 
  notifications={notifications}
  onDismiss={removeNotification}
  onClear={clearAllNotifications}
/>
```

## Usage Examples

### When a new message arrives:
```javascript
addNotification(`New message from ${otherUser}`, 'message', 5000);
```

### When someone comes online:
```javascript
addNotification(`${username} is now online`, 'user', 4000);
```

### When someone is typing:
```javascript
addNotification(`${otherUser} is typing...`, 'typing', 3000);
```

### For success messages:
```javascript
addNotification('Message sent successfully', 'success', 3000);
```

### For errors:
```javascript
addNotification('Failed to send message', 'error', 5000);
```

### For warnings:
```javascript
addNotification('Connection unstable', 'warning', 5000);
```

## Notification Types

The component supports these notification types:
- `'success'` - Green icon, for successful operations (✓)
- `'error'` - Red icon, for errors (✕)
- `'warning'` - Orange icon, for warnings (⚠)
- `'info'` - Blue icon, for general info (ℹ)
- `'message'` - Purple icon, for messages (💬)
- `'user'` - Pink icon, for user status (👤)
- `'typing'` - Cyan icon, for typing indicators (✎)

## Integration with Existing Features

### Hook into message fetching:
```javascript
// When new messages arrive from server
.then(res => res.json())
.then(data => {
  setMessages(data.messages);
  if (data.messages.length > 0) {
    addNotification(`${otherUser} sent a message`, 'message', 4000);
  }
})
```

### Hook into online users:
```javascript
// When online status changes
.then(users => {
  const newUser = users.find(u => !onlineUsers.includes(u));
  if (newUser && newUser !== currentUser) {
    addNotification(`${newUser} came online`, 'user', 3000);
  }
  setOnlineUsers(users);
})
```

### Hook into typing indicator:
```javascript
// When someone starts typing
if (otherUserTyping) {
  addNotification(`${otherUser} is typing...`, 'typing', 3000);
}
```

## Customization Options

### Change Position
Edit `styles/notification-panel.module.css` and modify the `.panel` selector:
```css
.panel {
  right: 20px;    /* Change to 'left' for left side */
  top: 80px;      /* Adjust vertical position */
}
```

### Change Duration
Modify the default duration in function calls:
```javascript
addNotification('Your message', 'info', 10000); // 10 seconds
addNotification('Your message', 'info', 0);    // Permanent until dismissed
```

### Disable Auto-Dismiss
Pass `0` as the duration parameter to keep notifications visible until manually dismissed.

### Customize Colors
Edit the color values in `styles/notification-panel.module.css`:
```css
/* For example, change success color */
.notification.success {
  background: rgba(34, 197, 94, 0.1);
  border-left-color: #22c55e;
}
```

## Performance Tips

1. **Limit Active Notifications**: Automatically clear old notifications:
```javascript
const addNotification = (message, type = 'info', duration = 5000) => {
  const id = Date.now();
  const newNotification = {
    id,
    message,
    type,
    timestamp: new Date()
  };
  
  setNotifications(prev => {
    // Keep only last 10 notifications
    const updated = [...prev, newNotification];
    return updated.slice(-10);
  });
  
  if (duration > 0) {
    setTimeout(() => removeNotification(id), duration);
  }
  
  return id;
};
```

2. **Sound Notifications**: Add sound for important notifications:
```javascript
const playNotificationSound = () => {
  const audio = new Audio('/notification-sound.mp3');
  audio.play().catch(() => {});
};

const addNotification = (message, type = 'info', duration = 5000, playSound = false) => {
  // ... notification creation code ...
  if (playSound) playNotificationSound();
};
```

3. **Browser Notifications**: For critical alerts:
```javascript
const sendBrowserNotification = (title, options = {}) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, options);
  }
};
```

## Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design included
- Smooth animations with CSS transitions

## Next Steps
1. Copy and paste the integration code from Step 1-4 into your `pages/chat.js`
2. Add notification triggers where relevant in your existing code
3. Test the notifications in your app
4. Customize colors and timing as needed

For any questions, refer to the notification types and usage examples above!
