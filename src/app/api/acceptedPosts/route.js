import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snapshot = await adminDb
      .collection("uploads")
      .where("accepted", "==", true)
      .orderBy("timestamp", "desc")
      .get();

    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.() || null,
    }));

    return NextResponse.json({ success: true, posts });
  } catch (err) {
    console.error("Failed to load accepted posts:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
