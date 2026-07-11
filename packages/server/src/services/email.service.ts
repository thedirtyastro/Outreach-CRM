/**
 * server/services/email.service.ts
 *
 * Database operations and email-sending logic for the Email entity.
 * Resend integration lives here — route handlers stay thin.
 */

import { connectDB, Lead, Activity } from "@outreach/database";
import { Email } from "@outreach/database/schemas/email.schema";
import { resend } from "../resend";
import type { IEmail } from "@outreach/shared";

// ── Types ────────────────────────────────────────────────────────────────────

export interface ListEmailsOptions {
  userId: string;
  leadId?: string;
  status?: string;
  page?: number;
  limit?: number;
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

export interface SaveDraftInput {
  userId: string;
  leadId: string;
  subject: string;
  body: string;
  html?: string;
  attachments?: string[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function replaceVariables(text: string, lead: Record<string, unknown>): string {
  return text
    .replace(/\{\{name\}\}/g, (lead.name as string) || "")
    .replace(/\{\{company\}\}/g, (lead.company as string) || "")
    .replace(/\{\{role\}\}/g, (lead.designation as string) || "")
    .replace(/\{\{website\}\}/g, (lead.website as string) || "")
    .replace(/\{\{platform\}\}/g, (lead.platform as string) || "")
    .replace(/\{\{date\}\}/g, new Date().toLocaleDateString());
}

// ── Service functions ─────────────────────────────────────────────────────────

/** Paginated list of emails. */
export async function listEmails(options: ListEmailsOptions) {
  await connectDB();

  const { userId, leadId, status, page = 1, limit = 50 } = options;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { userId };
  if (leadId) filter.leadId = leadId;
  if (status) filter.status = status;

  const [emails, total] = await Promise.all([
    Email.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Email.countDocuments(filter),
  ]);

  return {
    emails: emails as unknown as IEmail[],
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

/** Send an email via Resend and persist the record. */
export async function sendEmail(input: SendEmailInput): Promise<IEmail> {
  await connectDB();

  const { userId, userEmail, leadId, subject, body, html, attachments = [] } = input;

  const lead = await Lead.findOne({ _id: leadId, userId });
  if (!lead || !lead.email) {
    throw new Error("Lead not found or has no email address");
  }

  const replacedSubject = replaceVariables(subject, lead.toObject());
  const replacedBody = replaceVariables(body, lead.toObject());

  const email = await Email.create({
    userId,
    leadId,
    subject: replacedSubject,
    body: replacedBody,
    html,
    from: userEmail,
    to: lead.email,
    status: "draft",
    attachments,
  });

  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: lead.email,
      subject: replacedSubject,
      html: html || `<p>${replacedBody}</p>`,
      headers: { "X-Entity-Ref-ID": email._id.toString() },
    });

    await Email.findByIdAndUpdate(email._id, {
      status: "sent",
      messageId: result.data?.id,
    });

    await Activity.create({
      userId,
      leadId,
      type: "email_sent",
      description: `Email sent: ${replacedSubject}`,
      icon: "Mail",
      metadata: { emailId: email._id },
    });

    return { ...email.toObject(), status: "sent", messageId: result.data?.id } as unknown as IEmail;
  } catch (sendError) {
    await Email.findByIdAndUpdate(email._id, { status: "failed" });
    throw sendError;
  }
}

/** Save an email draft without sending. */
export async function saveDraft(input: SaveDraftInput): Promise<IEmail> {
  await connectDB();

  const { userId, leadId, subject, body, html, attachments = [] } = input;

  const email = await Email.create({
    userId,
    leadId,
    subject,
    body,
    html,
    from: "",
    to: "",
    status: "draft",
    attachments,
  });

  return email.toObject() as unknown as IEmail;
}

/** Get a single email by id (scoped to userId). */
export async function getEmailById(id: string, userId: string): Promise<IEmail | null> {
  await connectDB();
  const email = await Email.findOne({ _id: id, userId }).lean();
  return email as unknown as IEmail | null;
}

/** Update an email record. */
export async function updateEmail(
  id: string,
  userId: string,
  updates: Partial<IEmail>
): Promise<IEmail | null> {
  await connectDB();
  const email = await Email.findOneAndUpdate({ _id: id, userId }, updates, { new: true }).lean();
  return email as unknown as IEmail | null;
}

/** Delete an email record. */
export async function deleteEmail(id: string, userId: string): Promise<boolean> {
  await connectDB();
  const result = await Email.findOneAndDelete({ _id: id, userId });
  return result !== null;
}
