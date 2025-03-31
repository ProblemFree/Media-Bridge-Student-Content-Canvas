import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req) {
  try {
    const { id, moderator } = await req.json();
    if (!id || !moderator) throw new Error("Missing post ID or moderator");

    await adminDb.collection("uploads").doc(id).delete();

    await adminDb.collection("moderationLogs").add({
      type: "reject",
      postId: id,
      moderator,
      timestamp: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Reject error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
