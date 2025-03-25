import nodemailer from 'nodemailer';

export async function POST(req) {
  const { email, code } = await req.json();

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,       // Example: 'your.email@gmail.com'
      pass: process.env.EMAIL_PASS,       // Gmail App Password or SMTP password
    },
  });

  await transporter.sendMail({
    from: `GT Media Bridge <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Media Bridge Verification Code",
    text: `Here is your verification code: ${code}`,
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
