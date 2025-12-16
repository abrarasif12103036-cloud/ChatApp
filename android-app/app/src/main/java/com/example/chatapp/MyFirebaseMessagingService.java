package com.example.chatapp;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import com.example.chatapp.MainActivity;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class MyFirebaseMessagingService extends FirebaseMessagingService {

    private static final String CHANNEL_ID = "chat_notifications";
    private static final int NOTIFICATION_ID = 1;

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);

        // Handle notification messages
        if (remoteMessage.getNotification() != null) {
            RemoteMessage.Notification notification = remoteMessage.getNotification();
            String title = notification.getTitle();
            String body = notification.getBody();

            sendNotification(title, body);
        }

        // Handle data messages
        if (remoteMessage.getData().size() > 0) {
            // You can access data payload here if needed
            String senderUser = remoteMessage.getData().get("sender");
            String messageType = remoteMessage.getData().get("type");
        }
    }

    @Override
    public void onNewToken(String token) {
        super.onNewToken(token);
        // Save token locally
        saveTokenToPreferences(token);
        // Send token to backend server
        sendTokenToServer(token);
    }

    private void sendNotification(String title, String body) {
        createNotificationChannel();

        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0, intent,
                PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_launcher_foreground)
                .setContentTitle(title)
                .setContentText(body)
                .setAutoCancel(true)
                .setContentIntent(pendingIntent)
                .setPriority(NotificationCompat.PRIORITY_HIGH);

        NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (notificationManager != null) {
            notificationManager.notify(NOTIFICATION_ID, builder.build());
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = "Chat Notifications";
            String description = "Notifications for chat messages";
            int importance = NotificationManager.IMPORTANCE_HIGH;

            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, name, importance);
            channel.setDescription(description);

            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            if (notificationManager != null) {
                notificationManager.createNotificationChannel(channel);
            }
        }
    }

    private void saveTokenToPreferences(String token) {
        // Save token to SharedPreferences for later use
        getSharedPreferences("firebase_tokens", Context.MODE_PRIVATE)
                .edit()
                .putString("fcm_token", token)
                .apply();
    }

    private void sendTokenToServer(String token) {
        new Thread(() -> {
            try {
                // Get or create user ID
                String userId = getSharedPreferences("firebase_tokens", Context.MODE_PRIVATE)
                        .getString("user_id", "android_user_" + System.currentTimeMillis());
                
                // Save user ID if new
                getSharedPreferences("firebase_tokens", Context.MODE_PRIVATE)
                        .edit()
                        .putString("user_id", userId)
                        .apply();

                // Send token to backend
                URL url = new URL("https://chern-pryp.vercel.app/api/fcm-token");
                HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                connection.setRequestMethod("POST");
                connection.setRequestProperty("Content-Type", "application/json");
                connection.setDoOutput(true);

                String jsonBody = "{\"userId\":\"" + userId + "\",\"token\":\"" + token + "\"}";
                try (OutputStream os = connection.getOutputStream()) {
                    os.write(jsonBody.getBytes());
                    os.flush();
                }

                int responseCode = connection.getResponseCode();
                if (responseCode == 200) {
                    System.out.println("FCM token sent to server successfully");
                } else {
                    System.out.println("Failed to send FCM token: " + responseCode);
                }
                connection.disconnect();
            } catch (Exception e) {
                System.err.println("Error sending token to server: " + e.getMessage());
            }
        }).start();
    }
}
