import { adminDb } from "@/lib/firebaseAdmin";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email || !email.endsWith("@gatech.edu")) {
      return Response.json({ success: false, error: "Invalid email address" }, { status: 400 });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = crypto.createHash("sha256").update(code).digest("hex");

    await adminDb.collection("verificationCodes").doc(email).set({
      codeHash,
      createdAt: Date.now(),
      verified: false,
    });

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

    await transporter.sendMail({
      from: `"Media Bridge" <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: "Your Media Bridge Verification Code",
      text: `Your verification code is: ${code}`,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error sending code:", error);
    return Response.json({ success: false, error: "Failed to send verification email" }, { status: 500 });
  }
}
