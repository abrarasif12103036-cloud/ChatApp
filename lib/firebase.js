import admin from 'firebase-admin';

// Get service account from environment variable
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : null;

if (!admin.apps.length) {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
  } else {
    throw new Error('Firebase service account not configured. Check .env.local');
  }
}

const db = admin.database();

export default db;
