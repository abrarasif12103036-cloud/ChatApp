# 🔥 Firebase Realtime Database Setup Guide

Your chat app is now connected to **Firebase Realtime Database**! Here's how to set it up.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Create a new project"**
3. Project name: `Mohona-Abrar` (or your preference)
4. Click **"Create project"**

## Step 2: Create Realtime Database

1. In Firebase Console, click **"Realtime Database"** (left sidebar)
2. Click **"Create Database"**
3. Choose region: **United States** (or closest to you)
4. Security rules: Choose **"Start in test mode"**
5. Click **"Enable"**

You'll get a database URL like: `https://your-project-12345.firebaseio.com`

## Step 3: Create Service Account

1. Go to **Project Settings** (gear icon, top right)
2. Click **"Service accounts"** tab
3. Click **"Generate new private key"**
4. A JSON file will download - **SAVE THIS SAFELY!**

The file contains your credentials in this format:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "...",
  ...
}
```

## Step 4: Update `.env.local`

1. Open `.env.local` in your project
2. Copy the entire JSON from the service account file
3. Replace the `FIREBASE_SERVICE_ACCOUNT` value (keep the quotes!)
4. Update `FIREBASE_DATABASE_URL` with your database URL

Example:
```
FIREBASE_DATABASE_URL="https://mohona-abrar-12345.firebaseio.com"
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"mohona-abrar-12345","private_key":"...","client_email":"..."}'
```

**⚠️ Important:** Keep this private key SECRET! Never commit `.env.local` to git.

## Step 5: Add to `.gitignore` (if using git)

Make sure `.env.local` is in your `.gitignore`:
```
.env.local
.env
```

## Step 6: Start Your App

```powershell
npm run dev
```

Visit: `http://localhost:3000`

Login with:
- **Boy**: `Abrar` / `Abrarasif`  
- **Girl**: `Mohona` / `Mohona2024`

## ✅ What Changed

- ✅ MongoDB → Firebase Realtime Database
- ✅ Mongoose → Firebase Admin SDK
- ✅ All API routes updated
- ✅ Real-time capability (built-in!)

## 📂 Firebase Database Structure

Your data is organized like this:
```
mohona-abrar-12345/
├── messages/
│   ├── 1702758000000/
│   │   ├── sender: "boy"
│   │   ├── text: "Hello!"
│   │   ├── timestamp: "2025-12-16T20:30:00Z"
│   │   └── reactions: { "🖤": ["boy", "girl"] }
│   └── ...
├── onlineUsers/
│   ├── boy: { status: "online", lastUpdate: "..." }
│   └── girl: { status: "online", lastUpdate: "..." }
└── typingUsers/
    ├── boy: { isTyping: true, lastUpdate: "..." }
    └── ...
```

## 🔍 Monitor Your Database

1. Go to Firebase Console → **Realtime Database**
2. You can see live data updates!
3. Click on any node to expand and inspect

## 🐛 Troubleshooting

**"Permission denied" error?**
- Check your service account private key is correct
- Verify `FIREBASE_SERVICE_ACCOUNT` in `.env.local`

**"Database URL is invalid"?**
- Copy the full URL from Firebase Console
- Include `https://` and remove trailing slash

**Data not syncing?**
- Restart the dev server: `npm run dev`
- Check browser console for errors (F12)

**"Cannot find module 'firebase-admin'"?**
- Run: `npm install firebase-admin`

## 📚 Useful Commands

Check Firebase status:
```powershell
npm list firebase-admin
```

Test connection in Node:
```javascript
import admin from 'firebase-admin';
const db = admin.database();
console.log('Connected:', db ? 'Yes' : 'No');
```

## 🎯 Free Firebase Limits

- **Storage**: 1 GB per project
- **Downloads**: 100 connections
- **Concurrent connections**: 100
- **Great for**: Testing, small teams, demo projects

## 📖 Learn More

- [Firebase Realtime Database Docs](https://firebase.google.com/docs/database)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Node.js Quickstart](https://firebase.google.com/docs/admin/setup)

Happy chatting! 💬🔥
