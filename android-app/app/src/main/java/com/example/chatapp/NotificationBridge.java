package com.example.chatapp;

import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.app.PendingIntent;
import android.media.RingtoneManager;
import android.net.Uri;
import android.webkit.JavascriptInterface;
import androidx.core.app.NotificationCompat;

/**
 * JavaScript interface bridge for showing native Android notifications
 * This class must be a top-level public class to be properly exposed to JavaScript
 */
public class NotificationBridge {
    private Context context;
    private NotificationManager notificationManager;
    private static final String CHANNEL_ID = "chat_notifications";
    private static final int NOTIFICATION_ID = 1;

    public NotificationBridge(Context context, NotificationManager notificationManager) {
        this.context = context;
        this.notificationManager = notificationManager;
    }

    /**
     * Show a native Android notification
     * Called from JavaScript via: window.AndroidNotification.showNotification(title, message, sender)
     */
    @JavascriptInterface
    public void showNotification(String title, String message, String sender) {
        showNotificationNative(title, message, sender);
    }

    /**
     * Internal method to create and show the notification
     */
    private void showNotificationNative(String title, String message, String sender) {
        Uri soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_dialog_email)
                .setContentTitle(title)
                .setContentText(message)
                .setAutoCancel(true)
                .setSound(soundUri)
                .setVibrate(new long[]{0, 500, 250, 500})
                .setPriority(NotificationCompat.PRIORITY_DEFAULT);

        // Create intent to open the app when notification is clicked
        Intent intent = new Intent(context, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        builder.setContentIntent(pendingIntent);

        notificationManager.notify(NOTIFICATION_ID, builder.build());
    }
}
