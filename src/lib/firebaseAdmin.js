import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// Parse service account from environment variable (should be a valid JSON string)
let serviceAccount = {};
try {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  serviceAccount = typeof raw === "string" ? JSON.parse(raw) : {};
  if (!serviceAccount.project_id || !serviceAccount.private_key) {
    throw new Error("Missing required service account fields");
  }
} catch (e) {
  console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", e.message);
}

// Ensure app is only initialized once
const app = !getApps().length
  ? initializeApp({
      credential: cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "media-bridge-student-content.appspot.com",
    })
  : getApps()[0];

const adminDb = getFirestore();
const bucket = getStorage().bucket();

export { adminDb, bucket };
