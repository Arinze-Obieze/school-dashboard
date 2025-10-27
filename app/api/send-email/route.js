import { NextResponse } from "next/server";
import { SendMailClient } from "zeptomail";

export const runtime = "nodejs";
const url = "api.zeptomail.com/";
const token = process.env.ZEPTOMAIL_API_KEY; 
const client = new SendMailClient({ url, token });

export async function POST(req) {
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

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
