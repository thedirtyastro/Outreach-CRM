import { NextRequest, NextResponse } from "next/server";
import { auth } from "@outreach/server/auth";
import { connectDB } from "@outreach/database/connection";
import { Email } from "@outreach/database/schemas/email.schema";
import { Lead } from "@outreach/database/schemas/lead.schema";
import { Activity } from "@outreach/database/schemas/activity.schema";
import { resend } from "@outreach/server/resend";
import { z } from "zod";

const emailSchema = z.object({
  leadId: z.string(),
  subject: z.string().min(1),
  body: z.string().min(1),
  html: z.string().optional(),
  attachments: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get("leadId");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    await connectDB();

    const filter: Record<string, unknown> = { userId: session.user.id };
    if (leadId) filter.leadId = leadId;
    if (status) filter.status = status;

    const [emails, total] = await Promise.all([
      Email.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Email.countDocuments(filter),
    ]);

    return NextResponse.json({
      emails,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching emails:", error);
    return NextResponse.json(
      { error: "Failed to fetch emails" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = emailSchema.parse(body);

    await connectDB();

    // Get lead info
    const lead = await Lead.findOne({
      _id: validated.leadId,
      userId: session.user.id,
    });

    if (!lead || !lead.email) {
      return NextResponse.json(
        { error: "Lead not found or has no email" },
        { status: 404 }
      );
    }

    // Replace variables in body and subject
    const replacedSubject = replaceVariables(validated.subject, lead);
    const replacedBody = replaceVariables(validated.body, lead);

    // Create email record
    const email = await Email.create({
      userId: session.user.id,
      leadId: validated.leadId,
      subject: replacedSubject,
      body: replacedBody,
      html: validated.html,
      from: session.user.email,
      to: lead.email,
      status: "draft",
      attachments: validated.attachments || [],
    });

    // Send email via Resend
    try {
      const result = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        to: lead.email,
        subject: replacedSubject,
        html: validated.html || `<p>${replacedBody}</p>`,
        headers: {
          "X-Entity-Ref-ID": email._id.toString(),
        },
      });

      // Update email with messageId
      await Email.findByIdAndUpdate(email._id, {
        status: "sent",
        messageId: result.data?.id,
      });

      // Create activity
      await Activity.create({
        userId: session.user.id,
        leadId: validated.leadId,
        type: "email_sent",
        description: `Email sent: ${replacedSubject}`,
        icon: "Mail",
        metadata: { emailId: email._id },
      });

      return NextResponse.json({ email, messageId: result.data?.id });
    } catch (sendError) {
      // Mark email as failed
      await Email.findByIdAndUpdate(email._id, { status: "failed" });
      throw sendError;
    }
  } catch (error) {
    console.error("Error sending email:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}

function replaceVariables(text: string, lead: Record<string, unknown>): string {
  return text
    .replace(/\{\{name\}\}/g, (lead.name as string) || "")
    .replace(/\{\{company\}\}/g, (lead.company as string) || "")
    .replace(/\{\{role\}\}/g, (lead.designation as string) || "")
    .replace(/\{\{website\}\}/g, (lead.website as string) || "")
    .replace(/\{\{platform\}\}/g, (lead.platform as string) || "")
    .replace(/\{\{date\}\}/g, new Date().toLocaleDateString());
}
