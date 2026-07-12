import { NextRequest, NextResponse } from "next/server";
import { handleResendWebhook } from "@outreach/server";
import { Webhook } from "standardwebhooks";

const webhookSecret = process.env.RESEND_WEBHOOK_SECRET || "";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const headers = Object.fromEntries(request.headers.entries());

    if (webhookSecret) {
      try {
        const wh = new Webhook(webhookSecret);
        wh.verify(rawBody, headers);
      } catch {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    const event = JSON.parse(rawBody);
    const eventType = event.type as string;
    const emailData = event.data as Record<string, unknown>;

    await handleResendWebhook(eventType, emailData);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
