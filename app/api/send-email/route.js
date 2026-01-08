import { NextResponse } from "next/server";
import { SendMailClient } from "zeptomail";
import { checkRateLimit } from "@/lib/rateLimit";
import { validateEmail, sanitizeString } from "@/lib/inputValidator";

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
    return NextResponse.json({ error: "Email configuration error" }, { status: 500 });
  }

  try {
    const { to, subject, message, name } = await req.json();

    // Validate email
    const emailValidation = validateEmail(to);
    if (!emailValidation.valid) {
      return NextResponse.json({ error: emailValidation.error }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedSubject = sanitizeString(subject, { maxLength: 200 });
    const sanitizedMessage = sanitizeString(message, { maxLength: 10000, allowHTML: true });
    const sanitizedName = sanitizeString(name, { maxLength: 100 });

    if (!sanitizedSubject || !sanitizedMessage) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
    }

    const response = await client.sendMail({
      from: {
        address: "admin@" + process.env.ZEPTOMAIL_SENDER_EMAIL,
        name: "waccps"
      },
      to: [
        {
          email_address: {
            address: emailValidation.sanitized,
            name: sanitizedName || "Valued User",
          }
        }
      ],
      "subject": sanitizedSubject,
      htmlbody: `<div>${sanitizedMessage}</div>`,
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
