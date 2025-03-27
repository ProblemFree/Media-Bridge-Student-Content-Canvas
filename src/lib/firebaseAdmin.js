import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// Only initialize once
const app = !getApps().length
  ? initializeApp({
      credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)),
      storageBucket: "media-bridge-student-content.firebasestorage.app",
    })
  : getApps()[0];

const adminDb = getFirestore();
const bucket = getStorage().bucket();

export { adminDb, bucket };
