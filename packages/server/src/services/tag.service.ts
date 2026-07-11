/**
 * server/services/tag.service.ts
 *
 * Database operations for the Tag entity.
 */

import { connectDB } from "@outreach/database";
import { Tag } from "@outreach/database/schemas/tag.schema";
import type { ITag } from "@outreach/shared";

/** List all tags for a user. */
export async function listTags(userId: string): Promise<ITag[]> {
  await connectDB();
  const tags = await Tag.find({ userId }).sort({ name: 1 }).lean();
  return tags as unknown as ITag[];
}

/** Create a tag. Returns null if a tag with the same name already exists. */
export async function createTag(
  userId: string,
  name: string,
  color = "#6366f1"
): Promise<ITag | null> {
  await connectDB();

  const existing = await Tag.findOne({ userId, name });
  if (existing) return null;

  const tag = await Tag.create({ userId, name, color });
  return tag.toObject() as unknown as ITag;
}

/** Update a tag (name / color). */
export async function updateTag(
  id: string,
  userId: string,
  updates: Partial<{ name: string; color: string }>
): Promise<ITag | null> {
  await connectDB();
  const tag = await Tag.findOneAndUpdate({ _id: id, userId }, updates, { new: true }).lean();
  return tag as unknown as ITag | null;
}

/** Delete a tag. */
export async function deleteTag(id: string, userId: string): Promise<boolean> {
  await connectDB();
  const result = await Tag.findOneAndDelete({ _id: id, userId });
  return result !== null;
}
