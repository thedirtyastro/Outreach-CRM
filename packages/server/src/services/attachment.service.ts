/**
 * server/services/attachment.service.ts
 *
 * Database operations for the Attachment entity.
 * File storage integration (S3/R2) should be added here when ready.
 */

import { connectDB } from "@outreach/database";
import { Attachment } from "@outreach/database/schemas/attachment.schema";
import { Activity } from "@outreach/database/schemas/activity.schema";
import type { IAttachment } from "@outreach/shared";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  "text/plain",
];

export interface CreateAttachmentInput {
  userId: string;
  leadId?: string;
  emailId?: string;
  name: string;
  size: number;
  mimeType: string;
  /** File contents as a Buffer — upload to cloud storage when integrated */
  buffer?: Buffer;
}

/** List attachments for a lead, scoped to userId. */
export async function listAttachmentsForLead(
  leadId: string,
  userId: string
): Promise<IAttachment[]> {
  await connectDB();
  const attachments = await Attachment.find({ userId, leadId })
    .sort({ createdAt: -1 })
    .lean();
  return attachments as unknown as IAttachment[];
}

/** Persist attachment metadata.
 * TODO: upload buffer to S3/R2 and store the public URL.
 */
export async function createAttachment(
  input: CreateAttachmentInput
): Promise<{ attachment: IAttachment | null; error: string | null }> {
  const { userId, leadId, emailId, name, size, mimeType } = input;

  if (size > MAX_FILE_SIZE) {
    return { attachment: null, error: "File too large (max 10 MB)" };
  }

  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return { attachment: null, error: "File type not allowed" };
  }

  await connectDB();

  // TODO: when cloud storage is integrated, upload buffer here and set url to the public URL
  const fileName = `${Date.now()}-${name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const url = `/uploads/${fileName}`;

  const attachment = await Attachment.create({
    userId,
    leadId: leadId || undefined,
    emailId: emailId || undefined,
    name,
    url,
    size,
    mimeType,
  });

  if (leadId) {
    await Activity.create({
      userId,
      leadId,
      type: "attachment_added",
      description: `Attachment uploaded: ${name}`,
      icon: "Paperclip",
      metadata: { attachmentId: attachment._id },
    });
  }

  return { attachment: attachment.toObject() as unknown as IAttachment, error: null };
}

/** Delete an attachment (and its cloud file when storage is integrated). */
export async function deleteAttachment(
  attachmentId: string,
  leadId: string,
  userId: string
): Promise<{ deleted: boolean; name?: string }> {
  await connectDB();

  const attachment = await Attachment.findOneAndDelete({
    _id: attachmentId,
    userId,
    leadId,
  });

  if (!attachment) return { deleted: false };

  // TODO: delete from cloud storage using attachment.url

  await Activity.create({
    userId,
    leadId,
    type: "attachment_added", // reusing closest existing type
    description: `Attachment removed: ${attachment.name}`,
    icon: "Paperclip",
  });

  return { deleted: true, name: attachment.name };
}
