# Android Chat App Setup Instructions

## Quick Start

This is a WebView wrapper for your Vercel chat app: `https://chern-pryp.vercel.app/`

### Steps to Setup in Android Studio:

1. **Create a New Project**
   - Open Android Studio
   - Click "New Project"
   - Choose "Empty Activity"
   - Name: ChatApp
   - Package Name: com.example.chatapp
   - Minimum SDK: API 21 or higher

2. **Replace/Add Files**
   - Copy `MainActivity.java` to `app/src/main/java/com/example/chatapp/`
   - Copy `activity_main.xml` to `app/src/main/res/layout/`
   - Copy `AndroidManifest.xml` to `app/src/main/` (replace existing)
   - Copy `build.gradle` to `app/` (replace existing)
   - Copy `strings.xml` to `app/src/main/res/values/` (replace existing)

3. **Update build.gradle (Project level)**
   ```gradle
   plugins {
       id 'com.android.application' version '8.0.0' apply false
   }
   ```

4. **Build & Run**
   - Click "Run" or press Shift+F10
   - Select an emulator or connected device
   - The app will launch and display your chat app

## Features

✅ Loads your Vercel app in WebView  
✅ Internet permission enabled  
✅ Back button navigation support  
✅ JavaScript enabled  
✅ Local storage support  

## Notes

- No backend changes needed
- Your Vercel deployment stays the same
- The Android app acts as a browser wrapper
- All functionality from your web app works identically

## Troubleshooting

**White screen on startup?**
- Check internet permission in AndroidManifest.xml
- Verify your Vercel URL is accessible from your device/emulator

**JavaScript not working?**
- JavaScript is already enabled in MainActivity.java

**Back button not working?**
- It's handled in the onBackPressed() method

