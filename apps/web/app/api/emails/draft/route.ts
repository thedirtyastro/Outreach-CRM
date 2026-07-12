import { NextRequest, NextResponse } from "next/server";
import { auth } from "@outreach/server/auth";
import { supabase } from "@outreach/database/client";
import { z } from "zod";

const draftSchema = z.object({
  leadId: z.string().min(1),
  subject: z.string().default(""),
  body: z.string().default(""),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const validated = draftSchema.parse(body);

    const { data: lead } = await supabase.from("leads").select("email").eq("id", validated.leadId).eq("user_id", session.user.id).maybeSingle();
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    const { data: draft, error } = await supabase.from("emails").insert({
      user_id: session.user.id, lead_id: validated.leadId,
      subject: validated.subject, body: validated.body,
      from: session.user.email, to: (lead as unknown as { email: string | null }).email ?? "",
      status: "draft" as const,
    }).select().single();

    if (error) throw error;
    return NextResponse.json({ success: true, data: draft }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    return NextResponse.json({ error: "Failed to save draft" }, { status: 500 });
  }
}
