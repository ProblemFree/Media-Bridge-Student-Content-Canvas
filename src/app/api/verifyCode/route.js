import { db } from '/lib/firebaseConfig';
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from 'firebase/firestore';

export async function POST(req) {
  try {
    const { email, codeHash } = await req.json();

    if (!email || !codeHash) {
      return new Response(JSON.stringify({ success: false, error: "Missing fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const q = query(
      collection(db, "verificationCodes"),
      where("email", "==", email),
      where("codeHash", "==", codeHash),
      where("verified", "==", false)
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const match = snapshot.docs[0];
      await updateDoc(doc(db, "verificationCodes", match.id), { verified: true });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ success: false, error: "Code not found or already used" }), {
      status: 404,
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
