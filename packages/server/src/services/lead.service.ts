/**
 * server/services/lead.service.ts
 *
 * All database operations for the Lead entity.
 * API route handlers should call these functions instead of querying MongoDB directly.
 */

import { connectDB, Lead, Activity } from "@outreach/database";
import { createLeadSchema, updateLeadSchema } from "@outreach/shared/validations";
import type { ILead, ApiResponse, PaginatedResponse } from "@outreach/shared";
import type { LeadFilters, LeadSort } from "@outreach/shared";

// ── Types ────────────────────────────────────────────────────────────────────

export interface ListLeadsOptions {
  userId: string;
  page?: number;
  limit?: number;
  search?: string;
  status?: string[];
  platform?: string[];
  priority?: string[];
  response?: string[];
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  isArchived?: boolean;
  sortField?: string;
  sortDir?: 1 | -1;
}

export interface BulkLeadsOptions {
  userId: string;
  ids: string[];
  action: "delete" | "archive" | "restore";
}

export interface ImportLeadsOptions {
  userId: string;
  /** Raw CSV text content */
  csvText: string;
}

export interface ImportResult {
  created: number;
  skipped: number;
  errors: string[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const REQUIRED_CSV_COLS = ["name", "platform"] as const;

function parseCsvRow(row: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === '"') {
      if (inQuotes && row[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells;
}

function escapeCsv(value: unknown): string {
  if (value == null) return "";
  const str = Array.isArray(value) ? value.join("; ") : String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// ── Service functions ─────────────────────────────────────────────────────────

/** Paginated, filtered list of leads. */
export async function listLeads(options: ListLeadsOptions) {
  await connectDB();

  const {
    userId,
    page = 1,
    limit = 20,
    search,
    status,
    platform,
    priority,
    response,
    tags,
    dateFrom,
    dateTo,
    isArchived = false,
    sortField = "createdAt",
    sortDir = -1,
  } = options;

  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));
  const skip = (safePage - 1) * safeLimit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: Record<string, any> = { userId, isArchived };

  if (search) query.$text = { $search: search };
  if (status?.length) query.status = { $in: status };
  if (platform?.length) query.platform = { $in: platform };
  if (priority?.length) query.priority = { $in: priority };
  if (response?.length) query.response = { $in: response };
  if (tags?.length) query.tags = { $in: tags };
  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(dateTo);
  }

  const [data, total] = await Promise.all([
    Lead.find(query).sort({ [sortField]: sortDir }).skip(skip).limit(safeLimit).lean(),
    Lead.countDocuments(query),
  ]);

  return {
    data: data as unknown as ILead[],
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit),
  } satisfies PaginatedResponse<ILead>;
}

/** Create a single lead and log its activity. Returns the created lead, or null if duplicate. */
export async function createLead(
  userId: string,
  input: unknown
): Promise<{ lead: ILead | null; duplicate: ILead | null; validationError: string | null }> {
  await connectDB();

  const parsed = createLeadSchema.safeParse(input);
  if (!parsed.success) {
    return {
      lead: null,
      duplicate: null,
      validationError: parsed.error.issues[0]?.message ?? "Validation error",
    };
  }

  // Duplicate detection
  const { email, linkedin } = parsed.data;
  if (email || linkedin) {
    const orConditions = [];
    if (email) orConditions.push({ email, userId });
    if (linkedin) orConditions.push({ linkedin, userId });
    const existing = orConditions.length > 0
      ? await Lead.findOne({ $or: orConditions }).lean()
      : null;

    if (existing) {
      return { lead: null, duplicate: existing as unknown as ILead, validationError: null };
    }
  }

  const lead = await Lead.create({ ...parsed.data, userId });

  await Activity.create({
    userId,
    leadId: lead._id,
    type: "lead_created",
    description: `Lead ${lead.name} was created`,
    icon: "user-plus",
  });

  return { lead: lead.toJSON() as unknown as ILead, duplicate: null, validationError: null };
}

/** Get a single lead by id (scoped to userId). */
export async function getLeadById(id: string, userId: string): Promise<ILead | null> {
  await connectDB();
  const lead = await Lead.findOne({ _id: id, userId }).lean();
  return lead as unknown as ILead | null;
}

/** Update a lead and log the activity. */
export async function updateLead(
  id: string,
  userId: string,
  input: unknown
): Promise<{ lead: ILead | null; validationError: string | null }> {
  await connectDB();

  const parsed = updateLeadSchema.safeParse(input);
  if (!parsed.success) {
    return { lead: null, validationError: parsed.error.issues[0]?.message ?? "Validation error" };
  }

  const lead = await Lead.findOne({ _id: id, userId });
  if (!lead) return { lead: null, validationError: null };

  const previousStatus = lead.status;
  Object.assign(lead, parsed.data);
  await lead.save();

  if (parsed.data.status && parsed.data.status !== previousStatus) {
    await Activity.create({
      userId,
      leadId: id,
      type: "status_changed",
      description: `Status changed from ${previousStatus} to ${parsed.data.status}`,
      icon: "refresh-cw",
      metadata: { from: previousStatus, to: parsed.data.status },
    });
  } else {
    await Activity.create({
      userId,
      leadId: id,
      type: "lead_updated",
      description: `Lead ${lead.name} was updated`,
      icon: "pencil",
    });
  }

  return { lead: lead.toJSON() as unknown as ILead, validationError: null };
}

/** Delete a single lead. Returns true if found and deleted. */
export async function deleteLead(id: string, userId: string): Promise<boolean> {
  await connectDB();
  const lead = await Lead.findOneAndDelete({ _id: id, userId });
  return lead !== null;
}

/** Bulk delete / archive / restore leads. */
export async function bulkLeads(options: BulkLeadsOptions): Promise<void> {
  await connectDB();
  const { userId, ids, action } = options;
  const filter = { _id: { $in: ids }, userId };

  if (action === "delete") {
    await Lead.deleteMany(filter);
  } else if (action === "archive") {
    await Lead.updateMany(filter, { $set: { isArchived: true, archivedAt: new Date() } });
  } else if (action === "restore") {
    await Lead.updateMany(filter, { $set: { isArchived: false }, $unset: { archivedAt: "" } });
  }
}

/** Export all user leads as a CSV string. */
export async function exportLeadsCsv(userId: string): Promise<string> {
  await connectDB();

  const leads = (await Lead.find({ userId }).sort({ createdAt: -1 }).lean()) as unknown as ILead[];

  const CSV_HEADERS = [
    "name", "company", "designation", "industry",
    "email", "phone", "website", "linkedin", "twitter",
    "instagram", "github", "location", "platform",
    "status", "priority", "response", "budget",
    "expectedRevenue", "projectType", "tags",
    "bio", "score", "nextFollowUp", "createdAt",
  ];

  const rows = leads.map((l) =>
    CSV_HEADERS.map((h) => escapeCsv(l[h as keyof ILead])).join(",")
  );

  return [CSV_HEADERS.join(","), ...rows].join("\n");
}

/** Import leads from raw CSV text. */
export async function importLeadsCsv(options: ImportLeadsOptions): Promise<ImportResult> {
  await connectDB();
  const { userId, csvText } = options;

  const lines = csvText.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) {
    throw new Error("CSV must have a header row and at least one data row");
  }

  const columnHeaders = parseCsvRow(lines[0]).map((h) => h.toLowerCase().trim());

  for (const col of REQUIRED_CSV_COLS) {
    if (!columnHeaders.includes(col)) {
      throw new Error(`Missing required column: "${col}"`);
    }
  }

  const results: ImportResult = { created: 0, skipped: 0, errors: [] };

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvRow(lines[i]);
    const row: Record<string, string> = {};
    columnHeaders.forEach((h, idx) => { row[h] = values[idx] ?? ""; });

    const raw = {
      name: row.name,
      platform: row.platform,
      company: row.company || undefined,
      designation: row.designation || undefined,
      industry: row.industry || undefined,
      email: row.email || undefined,
      phone: row.phone || undefined,
      website: row.website || undefined,
      linkedin: row.linkedin || undefined,
      twitter: row.twitter || undefined,
      instagram: row.instagram || undefined,
      github: row.github || undefined,
      location: row.location || undefined,
      bio: row.bio || undefined,
      status: row.status || "new",
      priority: row.priority || "medium",
      response: row.response || "none",
      budget: row.budget ? Number(row.budget) : undefined,
      expectedRevenue: row.expectedrevenue ? Number(row.expectedrevenue) : undefined,
      projectType: row.projecttype || undefined,
      tags: row.tags ? row.tags.split(";").map((t) => t.trim()).filter(Boolean) : [],
      nextFollowUp: row.nextfollowup || undefined,
    };

    const parsed = createLeadSchema.safeParse(raw);
    if (!parsed.success) {
      results.errors.push(`Row ${i}: ${parsed.error.issues[0]?.message ?? "Validation error"}`);
      results.skipped++;
      continue;
    }

    const { email, linkedin } = parsed.data;
    if (email || linkedin) {
      const orConditions = [];
      if (email) orConditions.push({ email, userId });
      if (linkedin) orConditions.push({ linkedin, userId });
      const existing = await Lead.findOne({ $or: orConditions }).lean();
      if (existing) { results.skipped++; continue; }
    }

    await Lead.create({ ...parsed.data, userId });
    results.created++;
  }

  return results;
}
