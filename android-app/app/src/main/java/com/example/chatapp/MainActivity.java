package com.example.chatapp;

import android.Manifest;
import android.os.Build;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import android.content.pm.PackageManager;
import com.google.firebase.messaging.FirebaseMessaging;
import java.net.URL;
import java.net.HttpURLConnection;

public class MainActivity extends AppCompatActivity {

    private WebView webView;
    private static final int NOTIFICATION_PERMISSION_REQUEST = 101;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);

        // Configure WebView settings
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true);
        webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);

        // Set WebViewClient to handle page loading
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                view.loadUrl(url);
                return true;
            }
        });

        // Request notification permission (Android 13+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                    != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this,
                        new String[]{Manifest.permission.POST_NOTIFICATIONS},
                        NOTIFICATION_PERMISSION_REQUEST);
            }
        }

        // Get FCM token and send to backend
        FirebaseMessaging.getInstance().getToken().addOnCompleteListener(task -> {
            if (!task.isSuccessful()) {
                System.err.println("Failed to get FCM token");
                return;
            }
            String token = task.getResult();
            System.out.println("FCM Token: " + token);
            sendTokenToServer(token);
        });

        // Load your chat application from production
        // For local development: webView.loadUrl("http://192.168.0.106:3000/chat");
        // For emulator: webView.loadUrl("http://10.0.2.2:3000/chat");
        webView.loadUrl("https://chern-pryp.vercel.app/chat");
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    private void sendTokenToServer(String token) {
        new Thread(() -> {
            try {
                String userId = "android_user_" + Build.MODEL + "_" + System.currentTimeMillis() % 10000;
                
                URL url = new URL("https://chern-pryp.vercel.app/api/fcm-token");
                HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                connection.setRequestMethod("POST");
                connection.setRequestProperty("Content-Type", "application/json");
                connection.setDoOutput(true);
                connection.setConnectTimeout(5000);

                String jsonBody = "{\"userId\":\"" + userId + "\",\"token\":\"" + token + "\"}";
                try (java.io.OutputStream os = connection.getOutputStream()) {
                    os.write(jsonBody.getBytes("UTF-8"));
                    os.flush();
                }

                int responseCode = connection.getResponseCode();
                System.out.println("FCM token sent. Response code: " + responseCode);
                connection.disconnect();
            } catch (Exception e) {
                System.err.println("Error sending token to server: " + e.getMessage());
                e.printStackTrace();
            }
        }).start();
    }
}
