import { adminDb } from "/lib/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";
import crypto from "crypto";

export async function POST(req) {
  try {
    const { email, code, userId } = await req.json();

    if (!email || !code || !userId) {
      return Response.json({ success: false, error: "Missing parameters" }, { status: 400 });
    }

    const codeDoc = await adminDb.collection("verificationCodes").doc(email).get();

    if (!codeDoc.exists) {
      return Response.json({ success: false, error: "No code found for this email" }, { status: 404 });
    }

    const { codeHash, createdAt } = codeDoc.data();

    // Expire after 10 minutes
    if (Date.now() - createdAt > 10 * 60 * 1000) {
      await adminDb.collection("verificationCodes").doc(email).delete();
      return Response.json({ success: false, error: "Code expired" }, { status: 403 });
    }

    const inputHash = crypto.createHash("sha256").update(code).digest("hex");

    if (inputHash !== codeHash) {
      return Response.json({ success: false, error: "Invalid code" }, { status: 403 });
    }

    // Mark user as verified
    await adminDb.collection("verifiedUsers").doc(userId).set({
      email,
      verifiedAt: Date.now(),
    });

    await adminDb.collection("verificationCodes").doc(email).delete();

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error verifying code:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
