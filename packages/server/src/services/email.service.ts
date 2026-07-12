/**
 * server/services/email.service.ts
 */

import { supabase } from "@outreach/database/client";
import { resend } from "../resend";
import type { IEmail } from "@outreach/shared";

function rowToEmail(row: Record<string, unknown>): IEmail {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    leadId: row.lead_id as string,
    messageId: row.message_id as string | undefined,
    subject: row.subject as string,
    body: row.body as string,
    html: row.html as string | undefined,
    from: row.from as string,
    to: row.to as string,
    status: row.status as IEmail["status"],
    threadId: row.thread_id as string | undefined,
    attachments: (row.attachments as string[]) ?? [],
    openedAt: row.opened_at as string | undefined,
    clickedAt: row.clicked_at as string | undefined,
    repliedAt: row.replied_at as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
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

export interface ListEmailsOptions {
  userId: string;
  leadId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export async function listEmails(options: ListEmailsOptions) {
  const { userId, leadId, status, page = 1, limit = 50 } = options;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("emails")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (leadId) query = query.eq("lead_id", leadId);
  if (status) query = query.eq("status", status);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  return {
    emails: (data ?? []).map(rowToEmail),
    pagination: { page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) },
  };
}

export interface SendEmailInput {
  userId: string;
  userEmail: string;
  leadId: string;
  subject: string;
  body: string;
  html?: string;
  attachments?: string[];
}

export async function sendEmail(input: SendEmailInput): Promise<IEmail> {
  const { userId, userEmail, leadId, subject, body, html, attachments = [] } = input;

  const { data: lead } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!lead?.email) throw new Error("Lead not found or has no email address");

  const replacedSubject = replaceVariables(subject, lead);
  const replacedBody = replaceVariables(body, lead);

  const { data: emailRow, error: insertError } = await supabase
    .from("emails")
    .insert({
      user_id: userId,
      lead_id: leadId,
      subject: replacedSubject,
      body: replacedBody,
      html: html ?? null,
      from: userEmail,
      to: lead.email,
      status: "draft",
      attachments,
    })
    .select()
    .single();

  if (insertError) throw new Error(insertError.message);

  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: lead.email,
      subject: replacedSubject,
      html: html || `<p>${replacedBody}</p>`,
      headers: { "X-Entity-Ref-ID": emailRow.id },
    });

    const { data: updated } = await supabase
      .from("emails")
      .update({ status: "sent", message_id: result.data?.id })
      .eq("id", emailRow.id)
      .select()
      .single();

    await supabase.from("activities").insert({
      user_id: userId,
      lead_id: leadId,
      type: "email_sent",
      description: `Email sent: ${replacedSubject}`,
      icon: "Mail",
      metadata: { emailId: emailRow.id },
    });

    return rowToEmail(updated ?? emailRow);
  } catch (sendError) {
    await supabase.from("emails").update({ status: "failed" }).eq("id", emailRow.id);
    throw sendError;
  }
}

export async function saveDraft(input: Omit<SendEmailInput, "userEmail"> & { userEmail?: string }): Promise<IEmail> {
  const { userId, leadId, subject, body, html, attachments = [] } = input;

  const { data, error } = await supabase
    .from("emails")
    .insert({
      user_id: userId,
      lead_id: leadId,
      subject,
      body,
      html: html ?? null,
      from: "",
      to: "",
      status: "draft",
      attachments,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToEmail(data);
}

export async function getEmailById(id: string, userId: string): Promise<IEmail | null> {
  const { data, error } = await supabase
    .from("emails")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? rowToEmail(data) : null;
}

export async function updateEmail(id: string, userId: string, updates: Partial<IEmail>): Promise<IEmail | null> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.messageId !== undefined) dbUpdates.message_id = updates.messageId;
  if (updates.openedAt !== undefined) dbUpdates.opened_at = updates.openedAt;
  if (updates.clickedAt !== undefined) dbUpdates.clicked_at = updates.clickedAt;

  const { data, error } = await supabase
    .from("emails")
    .update(dbUpdates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data ? rowToEmail(data) : null;
}

export async function deleteEmail(id: string, userId: string): Promise<boolean> {
  const { error, count } = await supabase
    .from("emails")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}

const RESEND_EVENT_TYPE_MAP: Record<string, string> = {
  "email.delivered": "delivered",
  "email.opened": "opened",
  "email.clicked": "clicked",
  "email.bounced": "bounced",
  "email.complained": "complained",
};

const ACTIVITY_TYPE_MAP: Record<string, string> = {
  opened: "email_opened",
  clicked: "email_clicked",
};

export async function handleResendWebhook(eventType: string, emailData: Record<string, unknown>): Promise<void> {
  const messageId = (emailData?.email_id || emailData?.message_id) as string | undefined;
  if (!messageId) return;

  const { data: email } = await supabase
    .from("emails")
    .select("*")
    .eq("message_id", messageId)
    .maybeSingle();

  if (!email) return;

  const internalType = RESEND_EVENT_TYPE_MAP[eventType];
  if (!internalType) return;

  await supabase.from("email_events").insert({
    email_id: email.id,
    lead_id: email.lead_id,
    type: internalType,
    data: emailData,
  });

  const updates: Record<string, string> = {};
  if (internalType === "opened" && !email.opened_at) {
    updates.opened_at = new Date().toISOString();
  }
  if (internalType === "clicked" && !email.clicked_at) {
    updates.clicked_at = new Date().toISOString();
  }

  if (Object.keys(updates).length > 0) {
    await supabase.from("emails").update(updates).eq("id", email.id);
  }

  const activityType = ACTIVITY_TYPE_MAP[internalType];
  if (activityType) {
    await supabase.from("activities").insert({
      user_id: email.user_id,
      lead_id: email.lead_id,
      type: activityType,
      description: `Email ${internalType}: ${email.subject}`,
      icon: "Mail",
      metadata: { emailId: email.id },
    });
  }
}
