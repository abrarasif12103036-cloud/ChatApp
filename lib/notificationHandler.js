import admin from 'firebase-admin';
import db from './firebase';

/**
 * Send FCM push notification to device
 */
export async function sendPushNotification(recipientToken, title, body, data = {}) {
  if (!recipientToken) {
    console.log('No FCM token provided, skipping push notification');
    return null;
  }

  try {
    const message = {
      notification: {
        title: title || 'Chat App',
        body: body || 'New message received'
      },
      data: {
        ...data,
        timestamp: new Date().toISOString()
      },
      token: recipientToken,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'messages',
          click_action: 'FLUTTER_NOTIFICATION_CLICK'
        }
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title: title || 'Chat App',
              body: body || 'New message received'
            },
            sound: 'default',
            badge: 1
          }
        }
      }
    };

    const response = await admin.messaging().send(message);
    console.log('Push notification sent:', response);
    return response;
  } catch (error) {
    console.error('Failed to send push notification:', error.message);
    return null;
  }
}

/**
 * Send notification to all users except sender
 */
export async function broadcastNotification(senderName, messageText, excludeUser = null) {
  try {
    // Get all FCM tokens from database
    const tokensSnapshot = await db.ref('fcmTokens').once('value');
    const tokensData = tokensSnapshot.val() || {};

    if (Object.keys(tokensData).length === 0) {
      console.log('No FCM tokens found in database');
      return;
    }

    const notifications = [];
    const title = `${senderName} sent a message`;
    const body = messageText.substring(0, 100); // First 100 chars

    // Send to all tokens
    for (const [userId, tokens] of Object.entries(tokensData)) {
      if (excludeUser && userId === excludeUser) {
        continue; // Skip sender
      }

      if (Array.isArray(tokens)) {
        for (const token of tokens) {
          notifications.push(
            sendPushNotification(token, title, body, {
              sender: senderName,
              preview: body
            })
          );
        }
      } else {
        // Handle case where tokens is a single string
        notifications.push(
          sendPushNotification(tokens, title, body, {
            sender: senderName,
            preview: body
          })
        );
      }
    }

    await Promise.all(notifications);
    console.log(`Notification sent to ${notifications.length} devices`);
  } catch (error) {
    console.error('Failed to broadcast notification:', error.message);
  }
}

/**
 * Save FCM token for a user
 */
export async function saveFCMToken(userId, token) {
  if (!userId || !token) {
    console.log('Invalid userId or token');
    return;
  }

  try {
    await db.ref(`fcmTokens/${userId}`).set(token);
    console.log(`FCM token saved for user ${userId}`);
  } catch (error) {
    console.error('Failed to save FCM token:', error.message);
  }
}

export default { sendPushNotification, broadcastNotification, saveFCMToken };
