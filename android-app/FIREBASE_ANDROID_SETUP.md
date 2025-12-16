# Firebase Notifications Setup for Android

## Step 1: Update Project-Level build.gradle

1. Open `android-app/build.gradle` (the top-level one)
2. Add Google Services plugin in the plugins section:

```gradle
plugins {
    id 'com.android.application' version '8.5.0' apply false
    id 'org.jetbrains.kotlin.android' version '1.9.21' apply false
    id 'com.google.gms.google-services' version '4.4.0' apply false
}
```

## Step 2: Update App-Level build.gradle

1. Open `android-app/app/build.gradle`
2. Add these Firebase dependencies in the `dependencies` section:

```gradle
// Firebase
implementation 'com.google.firebase:firebase-messaging:23.4.1'
implementation platform('com.google.firebase:firebase-bom:32.7.0')
```

3. Add this plugin at the END of the file (after the closing brace of dependencies):

```gradle
apply plugin: 'com.google.gms.google-services'
```

## Step 3: Copy google-services.json

1. The file `google-services.json` has been created in `android-app/app/`
2. **Important:** Replace it with your actual google-services.json from Firebase Console:
   - Go to Firebase Console → Project Settings → Download google-services.json
   - Place it in `android-app/app/`

## Step 4: Update AndroidManifest.xml

Add these permissions after `<uses-permission android:name="android.permission.INTERNET" />`:

```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

Add this service inside `<application>` tag (after the closing `</activity>` tag):

```xml
<service
    android:name=".MyFirebaseMessagingService"
    android:exported="false">
    <intent-filter>
        <action android:name="com.google.firebase.MESSAGING_EVENT" />
    </intent-filter>
</service>
```

## Step 5: Update MainActivity.java

Add this code to request notification permission in `onCreate()` method:

```java
// Request notification permission (Android 13+)
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
    if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
            != PackageManager.PERMISSION_GRANTED) {
        ActivityCompat.requestPermissions(this,
                new String[]{Manifest.permission.POST_NOTIFICATIONS},
                101);
    }
}
```

Add these imports at the top:

```java
import android.os.Build;
import androidx.core.content.ContextCompat;
import androidx.core.app.ActivityCompat;
import android.Manifest;
import android.content.pm.PackageManager;
```

## Step 6: Sync and Build

1. Click "Sync Now" when prompted
2. Build the project: `Build → Make Project`
3. If there are errors, check the Gradle console for details

## Testing

1. Run the app on a device or emulator
2. Look for notification permission request
3. Grant the permission
4. Send a message from the web app
5. You should see a native Android notification!

## Files Created

- `android-app/app/google-services.json` - Firebase configuration
- `android-app/app/src/main/java/com/example/chatapp/MyFirebaseMessagingService.java` - Message handler
- This setup guide

## Common Issues

**No notifications appearing:**
- Check that google-services.json is correct
- Verify app is signed with correct certificate
- Check that Firebase project ID matches

**Build errors:**
- Make sure all dependencies are installed
- Run `Sync Now` after any changes
- Check Gradle console for specific errors

**Permission denied:**
- App requires notification permission on Android 13+
- Make sure permission request is implemented in MainActivity
