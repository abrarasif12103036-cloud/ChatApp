package com.example.chatapp;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.RingtoneManager;
import android.net.Uri;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.NotificationCompat;
import android.os.Build;

public class MainActivity extends AppCompatActivity {

    private WebView webView;
    private NotificationManager notificationManager;
    private static final String CHANNEL_ID = "chat_notifications";
    private static final int NOTIFICATION_ID = 1;
    private ValueCallback<Uri[]> filePathCallback;
    private static final int FILE_CHOOSER_RESULT_CODE = 1;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        try {
            setContentView(R.layout.activity_main);

            webView = findViewById(R.id.webview);
            notificationManager = getSystemService(NotificationManager.class);
            
            if (webView == null) {
                Toast.makeText(this, "WebView not found in layout", Toast.LENGTH_LONG).show();
                return;
            }

            // Create notification channel for Android 8+
            createNotificationChannel();

            // Clear WebView cache to get latest version
            webView.clearCache(true);
            webView.clearHistory();

            // Configure WebView settings
            WebSettings webSettings = webView.getSettings();
            webSettings.setJavaScriptEnabled(true);
            webSettings.setDomStorageEnabled(true);
            webSettings.setDatabaseEnabled(true);
            webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
            webSettings.setAllowFileAccess(true);
            webSettings.setAllowContentAccess(true);
            webSettings.setCacheMode(WebSettings.LOAD_NO_CACHE);  // Disable caching

            // Set WebViewClient with error handling
            webView.setWebViewClient(new WebViewClient() {
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, String url) {
                    view.loadUrl(url);
                    return true;
                }

                @Override
                public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                    Toast.makeText(MainActivity.this, "Error: " + description, Toast.LENGTH_SHORT).show();
                }
            });

            webView.setWebChromeClient(new WebChromeClient() {
                @Override
                public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, WebChromeClient.FileChooserParams fileChooserParams) {
                    MainActivity.this.filePathCallback = filePathCallback;
                    Intent intent = fileChooserParams.createIntent();
                    try {
                        startActivityForResult(intent, FILE_CHOOSER_RESULT_CODE);
                    } catch (Exception e) {
                        Toast.makeText(MainActivity.this, "Cannot open file chooser", Toast.LENGTH_SHORT).show();
                        return false;
                    }
                    return true;
                }
            });

            // Add JavaScript interface for native notifications - MUST be before loadUrl
            webView.addJavascriptInterface(new NotificationBridge(this), "AndroidNotification");

            // Load production Vercel app
            webView.loadUrl("https://chern-pryp.vercel.app/chat");
        } catch (Exception e) {
            Toast.makeText(this, "Error: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == FILE_CHOOSER_RESULT_CODE) {
            if (filePathCallback == null) {
                super.onActivityResult(requestCode, resultCode, data);
                return;
            }
            Uri[] results = WebChromeClient.FileChooserParams.parseResult(resultCode, data);
            filePathCallback.onReceiveValue(results);
            filePathCallback = null;
        } else {
            super.onActivityResult(requestCode, resultCode, data);
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = "Chat Notifications";
            String description = "Notifications for new messages";
            int importance = NotificationManager.IMPORTANCE_DEFAULT;

            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, name, importance);
            channel.setDescription(description);
            channel.enableVibration(true);
            channel.setShowBadge(true);

            notificationManager.createNotificationChannel(channel);
        }
    }

    // JavaScript Interface class
    public class NotificationBridge {
        private Context context;

        public NotificationBridge(Context context) {
            this.context = context;
        }

        // Called from JavaScript to show notification
        public void showNotification(String title, String message, String sender) {
            showNotificationNative(title, message, sender);
        }

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

            // Create intent to open the app
            Intent intent = new Intent(context, MainActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            builder.setContentIntent(pendingIntent);

            notificationManager.notify(NOTIFICATION_ID, builder.build());
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
