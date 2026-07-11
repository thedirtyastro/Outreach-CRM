/**
 * server/services/note.service.ts
 *
 * Database operations for the Note entity.
 */

import { connectDB, Activity } from "@outreach/database";
import { Note } from "@outreach/database/schemas/note.schema";
import { createNoteSchema } from "@outreach/shared/validations";
import type { INote } from "@outreach/shared";

/** List notes, optionally filtered by leadId. Pinned notes sort first. */
export async function listNotes(userId: string, leadId?: string): Promise<INote[]> {
  await connectDB();

  const filter: Record<string, unknown> = { userId };
  if (leadId) filter.leadId = leadId;

  const notes = await Note.find(filter)
    .sort({ isPinned: -1, createdAt: -1 })
    .lean();

  return notes as unknown as INote[];
}

/** Create a note and log activity. */
export async function createNote(
  userId: string,
  input: unknown
): Promise<{ note: INote | null; validationError: string | null }> {
  await connectDB();

  const parsed = createNoteSchema.safeParse(input);
  if (!parsed.success) {
    return { note: null, validationError: parsed.error.issues[0]?.message ?? "Validation error" };
  }

  const note = await Note.create({ ...parsed.data, userId });

  await Activity.create({
    userId,
    leadId: parsed.data.leadId,
    type: "note_added",
    description: "Note added",
    icon: "FileText",
    metadata: { noteId: note._id },
  });

  return { note: note.toObject() as unknown as INote, validationError: null };
}

/** Update a note (content, isPinned). */
export async function updateNote(
  id: string,
  userId: string,
  updates: Partial<{ content: string; isPinned: boolean }>
): Promise<INote | null> {
  await connectDB();
  const note = await Note.findOneAndUpdate({ _id: id, userId }, updates, { new: true }).lean();
  return note as unknown as INote | null;
}

/** Delete a note. */
export async function deleteNote(id: string, userId: string): Promise<boolean> {
  await connectDB();
  const result = await Note.findOneAndDelete({ _id: id, userId });
  return result !== null;
}
