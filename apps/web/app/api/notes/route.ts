import { NextRequest, NextResponse } from "next/server";
import { auth } from "@outreach/server/auth";
import { connectDB } from "@outreach/database/connection";
import { Note } from "@outreach/database/schemas/note.schema";
import { Activity } from "@outreach/database/schemas/activity.schema";
import { z } from "zod";

const noteSchema = z.object({
  leadId: z.string(),
  content: z.string().min(1),
  isPinned: z.boolean().optional().default(false),
  attachments: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get("leadId");

    await connectDB();

    const filter: Record<string, unknown> = { userId: session.user.id };
    if (leadId) filter.leadId = leadId;

    const notes = await Note.find(filter)
      .sort({ isPinned: -1, createdAt: -1 })
      .lean();

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const validated = noteSchema.parse(body);

    await connectDB();

    const note = await Note.create({
      ...validated,
      userId: session.user.id,
    });

    await Activity.create({
      userId: session.user.id,
      leadId: validated.leadId,
      type: "note_added",
      description: "Note added",
      icon: "FileText",
      metadata: { noteId: note._id },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("Error creating note:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
