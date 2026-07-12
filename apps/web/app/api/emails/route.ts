import { NextRequest, NextResponse } from "next/server";
import { auth, listEmails, sendEmail } from "@outreach/server";
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
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get("leadId") || undefined;
    const status = searchParams.get("status") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const result = await listEmails({
      userId: session.user.id,
      leadId,
      status,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching emails:", error);
    return NextResponse.json({ error: "Failed to fetch emails" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const validated = emailSchema.parse(body);

    const email = await sendEmail({
      userId: session.user.id,
      userEmail: session.user.email,
      leadId: validated.leadId,
      subject: validated.subject,
      body: validated.body,
      html: validated.html,
      attachments: validated.attachments,
    });

    return NextResponse.json({ email });
  } catch (error) {
    console.error("Error sending email:", error);
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to send email" }, { status: 500 });
  }
}
