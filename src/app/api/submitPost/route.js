import { adminDb, bucket } from "@/lib/firebaseAdmin";
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
      const buffer = Buffer.from(await file.arrayBuffer());
      const originalName = formData.get("fileName") || "upload";
      const uniqueName = `${uuidv4()}-${originalName}`;
      const fileType = file.type || "application/octet-stream"; // fallback type

      const fileRef = bucket.file(`images/${uniqueName}`);
      await fileRef.save(buffer, {
        contentType: fileType,
        public: true,
        metadata: {
          firebaseStorageDownloadTokens: uuidv4(),
        },
      });

      fileUrl = `https://storage.googleapis.com/${bucket.name}/images/${uniqueName}`;
      fileName = uniqueName;
    }

    await adminDb.collection("uploads").add({
      email,
      userId,
      message,
      fileUrl,
      fileName,
      postType,
      accepted: true, //change to false if we want to moderate content before it goes on the feed.
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error handling post:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
