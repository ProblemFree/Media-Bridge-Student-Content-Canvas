import admin from "firebase-admin";

// Only initialize if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: "media-bridge-student-content.appspot.com" //Replace with your bucket if needed
  });
}

// Firestore instance
const db = admin.firestore();

// Storage bucket for file uploads
const bucket = admin.storage().bucket();

export { admin, db, bucket };
