import { db } from '@/lib/firebaseConfig';
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from 'firebase/firestore';

export async function POST(req) {
  const { email, codeHash } = await req.json();

  const q = query(
    collection(db, "verificationCodes"),
    where("email", "==", email),
    where("codeHash", "==", codeHash),
    where("verified", "==", false)
  );

  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const match = snapshot.docs[0];
    await updateDoc(doc(db, "verificationCodes", match.id), {
      verified: true
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ success: false }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' }
  });
}
