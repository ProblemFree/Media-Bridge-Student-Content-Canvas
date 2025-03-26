import { db } from '/lib/firebaseConfig';
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';

export async function POST(req) {
  try {
    const { email, codeHash } = await req.json();

    const q = query(
      collection(db, "verificationCodes"),
      where("email", "==", email),
      where("codeHash", "==", codeHash),
      where("verified", "==", false)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return new Response(JSON.stringify({ success: false, error: "Code not found or already used." }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    const match = snapshot.docs[0];
    const data = match.data();

    // Expiration check (10 minutes)
    const codeCreatedAt = data.createdAt?.toMillis?.();
    if (!codeCreatedAt || (Date.now() - codeCreatedAt > 10 * 60 * 1000)) {
      return new Response(JSON.stringify({ success: false, error: "Code expired" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Mark code verified
    await updateDoc(doc(db, "verificationCodes", match.id), { verified: true });

    // Register verified user
    const userId = email.split("@")[0]; // e.g., jdoe3
    await setDoc(doc(db, "verifiedUsers", userId), {
      email,
      verifiedAt: serverTimestamp(),
    });

    return new Response(JSON.stringify({ success: true, userId }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("VerifyCode error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
