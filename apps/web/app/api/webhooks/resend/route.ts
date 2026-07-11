import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@outreach/database/connection";
import { Email, EmailEvent } from "@outreach/database/schemas/email.schema";
import { Activity } from "@outreach/database/schemas/activity.schema";
import { Webhook } from "standardwebhooks";

const webhookSecret = process.env.RESEND_WEBHOOK_SECRET || "";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const headers = Object.fromEntries(request.headers.entries());

    // Verify webhook signature
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
    const emailData = event.data;

    await connectDB();

    // Find email by Resend message ID
    const messageId = emailData?.email_id || emailData?.message_id;
    if (!messageId) {
      return NextResponse.json({ received: true });
    }

    const email = await Email.findOne({ messageId });
    if (!email) {
      return NextResponse.json({ received: true });
    }

    // Map Resend event types to our types
    const eventTypeMap: Record<string, string> = {
      "email.delivered": "delivered",
      "email.opened": "opened",
      "email.clicked": "clicked",
      "email.bounced": "bounced",
      "email.complained": "complained",
    };

    const internalType = eventTypeMap[eventType];
    if (!internalType) {
      return NextResponse.json({ received: true });
    }

    // Create email event
    await EmailEvent.create({
      emailId: email._id,
      leadId: email.leadId,
      type: internalType,
      data: emailData,
    });

    // Update email fields
    const updates: Record<string, Date | string> = {};
    if (internalType === "opened" && !email.openedAt) {
      updates.openedAt = new Date();
    }
    if (internalType === "clicked" && !email.clickedAt) {
      updates.clickedAt = new Date();
    }

    if (Object.keys(updates).length > 0) {
      await Email.findByIdAndUpdate(email._id, updates);
    }

    // Create activity for opens/clicks/replies
    if (["opened", "clicked", "replied"].includes(internalType)) {
      const activityTypeMap: Record<string, string> = {
        opened: "email_opened",
        clicked: "email_clicked",
      };
      const activityType = activityTypeMap[internalType];
      if (activityType) {
        await Activity.create({
          userId: email.userId,
          leadId: email.leadId,
          type: activityType,
          description: `Email ${internalType}: ${email.subject}`,
          icon: "Mail",
          metadata: { emailId: email._id },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
