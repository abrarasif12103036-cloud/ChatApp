# Android Chat App - Build & Run Guide

## Updated for Localhost Backend

Your Android app has been updated to connect to your localhost Node.js server instead of the Vercel deployment.

## Prerequisites

1. **Android Studio** (latest version)
2. **Java JDK 11+**
3. **Node.js backend** running on `localhost:3002`

## Building the APK

### Option 1: Using Android Studio (Recommended)

1. Open Android Studio
2. Click **File → Open** and select the `ChatApp/android-app` folder
3. Wait for Gradle to sync
4. Click **Build → Build Bundle(s)/APK(s) → Build APK(s)**
5. APK will be generated at: `android-app/app/build/outputs/apk/debug/app-debug.apk`

### Option 2: Using Command Line (Gradle)

```bash
cd G:\PERSONAL\ChatApp\android-app
./gradlew.bat assembleDebug
```

APK will be at: `app/build/outputs/apk/debug/app-debug.apk`

## Connection Settings

### For Android Emulator (Localhost Testing)
- The app connects to: `http://10.0.2.2:3002/chat`
- This is the special alias for `localhost` in Android emulator

### For Physical Device
Update `MainActivity.java` line 39:
```java
// Replace this:
webView.loadUrl("http://10.0.2.2:3002/chat");

// With your PC's IP (e.g., 192.168.x.x):
webView.loadUrl("http://192.168.1.100:3002/chat");
```

To find your PC's IP:
- **Windows**: Run `ipconfig` in Command Prompt, look for "IPv4 Address"
- Make sure your phone is on the same WiFi network

## Running the App

### On Emulator
1. In Android Studio, click **Run → Run 'app'**
2. Select an emulator from the list
3. App will build and launch

### On Physical Device
1. Enable USB Debugging: Settings → Developer Options → USB Debugging
2. Connect phone via USB
3. Android Studio will detect it automatically
4. Click **Run → Run 'app'** and select your device

## Features Included

✅ Real-time messaging  
✅ Reply to messages  
✅ Emoji reactions (🖤 😂 😢 👍 👎)  
✅ Typing indicators  
✅ Online status  
✅ Three-dot menu with actions  
✅ Database persistence  

## Troubleshooting

**App won't connect to server:**
- Check that Node.js server is running on `localhost:3002`
- Verify the IP address is correct for your network
- Check that your firewall allows connections on port 3002

**APK won't install:**
- Uninstall the old version first
- Make sure your device has enough storage
- Enable "Unknown Sources" in settings if installing manually

**Build fails:**
- Run `gradlew clean` then `gradlew build`
- Update Android SDK: Tools → SDK Manager → Install updates

## Backend Still Required

Your **backend server must be running**:
```bash
npm run dev
```

The backend serves the API at:
- `http://localhost:3002/api/messages`
- `http://localhost:3002/api/reactions`
- `http://localhost:3002/api/typing`
- `http://localhost:3002/api/online`

---

**Current Setup:**
- Backend: `localhost:3002` (Next.js)
- Database: MongoDB (local or cloud)
- Android Frontend: WebView wrapper (latest features)
