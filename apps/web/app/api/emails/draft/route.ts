import { NextRequest, NextResponse } from "next/server";
import { auth } from "@outreach/server/auth";
import { connectDB } from "@outreach/database/connection";
import { Email } from "@outreach/database/schemas/email.schema";
import { Lead } from "@outreach/database/schemas/lead.schema";
import { z } from "zod";

const draftSchema = z.object({
  leadId: z.string().min(1),
  subject: z.string().default(""),
  body: z.string().default(""),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = draftSchema.parse(body);

    await connectDB();

    const lead = await Lead.findOne({
      _id: validated.leadId,
      userId: session.user.id,
    }).lean();

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const draft = await Email.create({
      userId: session.user.id,
      leadId: validated.leadId,
      subject: validated.subject,
      body: validated.body,
      from: session.user.email,
      to: (lead as { email?: string }).email ?? "",
      status: "draft",
    });

    return NextResponse.json({ success: true, data: draft }, { status: 201 });
  } catch (error) {
    console.error("Error saving draft:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to save draft" }, { status: 500 });
  }
}
