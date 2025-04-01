import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snapshot = await adminDb
      .collection("uploads")
      .orderBy("timestamp", "desc")
      .get();

    const submissions = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate?.() || null,
      };
    });

    return NextResponse.json({ success: true, submissions });
  } catch (err) {
    console.error("Failed to load submissions:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
