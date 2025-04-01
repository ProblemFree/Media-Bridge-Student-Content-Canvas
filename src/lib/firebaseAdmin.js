import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

let serviceAccount = {};

try {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is missing");
  }
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY.replace(/\\n/g, '\n'));
  if (typeof serviceAccount.project_id !== "string") {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is invalid: missing project_id");
  }
} catch (e) {
  console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", e.message);
}

const app = !getApps().length
  ? initializeApp({
      credential: cert(serviceAccount),
      storageBucket:
        process.env.FIREBASE_STORAGE_BUCKET || "media-bridge-student-content.firebasestorage.app",
    })
  : getApps()[0];

const adminDb = getFirestore();
const bucket = getStorage().bucket();

export { adminDb, bucket };
