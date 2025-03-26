import { db, bucket } from "/lib/firebaseAdmin";
import { v4 as uuidv4 } from "uuid";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const formData = await req.formData();

    const email = formData.get("email");
    const userId = formData.get("userId");
    const message = formData.get("message") || "";
    const postType = formData.get("postType") || "text";
    const file = formData.get("file");

    let fileUrl = "";
    let fileName = "";

    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const originalName = formData.get("fileName") || "upload";
      const uniqueName = `${uuidv4()}-${originalName}`;

      const fileRef = bucket.file(`images/${uniqueName}`);
      await fileRef.save(buffer, {
        contentType: file.type,
        public: true,
        metadata: {
          firebaseStorageDownloadTokens: uuidv4(),
        },
      });

      fileUrl = `https://storage.googleapis.com/${bucket.name}/images/${uniqueName}`;
      fileName = uniqueName;
    }

    await db.collection("uploads").add({
      email,
      userId,
      message,
      fileUrl,
      fileName,
      postType,
      accepted: false,
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error handling post:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
