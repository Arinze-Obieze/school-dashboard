import { NextResponse } from "next/server";
import { SendMailClient } from "zeptomail";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
const url = "api.zeptomail.com/";
const token = process.env.ZEPTOMAIL_API_KEY; 
const client = new SendMailClient({ url, token });

const RATE_LIMIT = 5; // 5 requests per minute for email sending

async function POST(req) {
  // Apply rate limiting
  const rateLimitResult = await checkRateLimit(req, RATE_LIMIT);
  if (!rateLimitResult.allowed) {
    return rateLimitResult;
  }

 if (!token) {
    console.error("❌ Zeptomail API key is missing");
    return NextResponse.json({ error: "Email configuration error" }, { status: 500 });
  }

  try {
    const { to, subject, message, name } = await req.json();

    const response = await client.sendMail({
      from: {
        address: "admin@" + process.env.ZEPTOMAIL_SENDER_EMAIL,
        name: "waccps"
      },
      to: [
        {
          email_address: {
            address: to,
            name: name || "Valued User",
          }
        }
      ],
      "subject": subject,
      htmlbody: `<div>${message}</div>`,
    });

    const emailResponse = NextResponse.json({ success: true, data: response });
    // Add rate limit headers
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      emailResponse.headers.set(key, value);
    });
    return emailResponse;
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export { POST };
