/**
 * server/services/attachment.service.ts
 */

import { supabase } from "@outreach/database/client";
import type { IAttachment } from "@outreach/shared";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const ALLOWED_MIME_TYPES = [
  "image/jpeg", "image/png", "image/gif", "image/webp",
  "application/pdf", "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip", "text/plain",
];

function rowToAttachment(row: Record<string, unknown>): IAttachment {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    leadId: row.lead_id as string | undefined,
    emailId: row.email_id as string | undefined,
    name: row.name as string,
    url: row.url as string,
    size: row.size as number,
    mimeType: row.mime_type as string,
    createdAt: row.created_at as string,
  };
}

export interface CreateAttachmentInput {
  userId: string;
  leadId?: string;
  emailId?: string;
  name: string;
  size: number;
  mimeType: string;
  buffer?: Buffer;
}

export async function listAttachmentsForLead(leadId: string, userId: string): Promise<IAttachment[]> {
  const { data, error } = await supabase
    .from("attachments")
    .select("*")
    .eq("user_id", userId)
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToAttachment);
}

export async function createAttachment(
  input: CreateAttachmentInput
): Promise<{ attachment: IAttachment | null; error: string | null }> {
  const { userId, leadId, emailId, name, size, mimeType } = input;

  if (size > MAX_FILE_SIZE) return { attachment: null, error: "File too large (max 10 MB)" };
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) return { attachment: null, error: "File type not allowed" };

  // TODO: upload to Supabase Storage (or S3/R2) and use the public URL
  const fileName = `${Date.now()}-${name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const url = `/uploads/${fileName}`;

  const { data, error: insertError } = await supabase
    .from("attachments")
    .insert({
      user_id: userId,
      lead_id: leadId ?? null,
      email_id: emailId ?? null,
      name,
      url,
      size,
      mime_type: mimeType,
    })
    .select()
    .single();

  if (insertError) throw new Error(insertError.message);

  if (leadId) {
    await supabase.from("activities").insert({
      user_id: userId,
      lead_id: leadId,
      type: "attachment_added",
      description: `Attachment uploaded: ${name}`,
      icon: "Paperclip",
      metadata: { attachmentId: data.id },
    });
  }

  return { attachment: rowToAttachment(data), error: null };
}

export async function deleteAttachment(
  attachmentId: string,
  leadId: string,
  userId: string
): Promise<{ deleted: boolean; name?: string }> {
  const { data, error } = await supabase
    .from("attachments")
    .delete()
    .eq("id", attachmentId)
    .eq("user_id", userId)
    .eq("lead_id", leadId)
    .select("name")
    .single();

  if (error || !data) return { deleted: false };

  // TODO: delete from Supabase Storage / cloud provider using data.url

  await supabase.from("activities").insert({
    user_id: userId,
    lead_id: leadId,
    type: "attachment_added",
    description: `Attachment removed: ${data.name}`,
    icon: "Paperclip",
  });

  return { deleted: true, name: data.name };
}
