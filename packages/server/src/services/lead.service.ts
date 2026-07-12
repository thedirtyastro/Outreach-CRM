/**
 * server/services/lead.service.ts
 *
 * All database operations for the Lead entity using Supabase.
 */

import { supabase } from "@outreach/database/client";
import { createLeadSchema, updateLeadSchema } from "@outreach/shared/validations";
import type { ILead, PaginatedResponse } from "@outreach/shared";

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
  sortDir?: "asc" | "desc";
}

export interface BulkLeadsOptions {
  userId: string;
  ids: string[];
  action: "delete" | "archive" | "restore";
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Convert snake_case DB row → camelCase ILead */
function rowToLead(row: Record<string, unknown>): ILead {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    company: row.company as string | undefined,
    designation: row.designation as string | undefined,
    industry: row.industry as string | undefined,
    email: row.email as string | undefined,
    phone: row.phone as string | undefined,
    whatsapp: row.whatsapp as string | undefined,
    website: row.website as string | undefined,
    linkedin: row.linkedin as string | undefined,
    twitter: row.twitter as string | undefined,
    instagram: row.instagram as string | undefined,
    github: row.github as string | undefined,
    portfolio: row.portfolio as string | undefined,
    location: row.location as string | undefined,
    bio: row.bio as string | undefined,
    profileImage: row.profile_image as string | undefined,
    tags: (row.tags as string[]) ?? [],
    priority: row.priority as ILead["priority"],
    status: row.status as ILead["status"],
    platform: row.platform as ILead["platform"],
    response: row.response as ILead["response"],
    budget: row.budget as number | undefined,
    expectedRevenue: row.expected_revenue as number | undefined,
    projectType: row.project_type as ILead["projectType"],
    lastContact: row.last_contact as string | undefined,
    nextFollowUp: row.next_follow_up as string | undefined,
    score: row.score as number | undefined,
    isArchived: row.is_archived as boolean,
    archivedAt: row.archived_at as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

const ALLOWED_SORT_FIELDS: Record<string, string> = {
  createdAt: "created_at",
  updatedAt: "updated_at",
  name: "name",
  status: "status",
  priority: "priority",
  platform: "platform",
};

function escapeCsv(value: unknown): string {
  if (value == null) return "";
  const str = Array.isArray(value) ? value.join("; ") : String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function parseCsvRow(row: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === '"') {
      if (inQuotes && row[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      cells.push(current.trim()); current = "";
    } else current += ch;
  }
  cells.push(current.trim());
  return cells;
}

// ── Service functions ─────────────────────────────────────────────────────────

/** Paginated, filtered list of leads. */
export async function listLeads(options: ListLeadsOptions): Promise<PaginatedResponse<ILead>> {
  const {
    userId, page = 1, limit = 20, search,
    status, platform, priority, response,
    tags, dateFrom, dateTo, isArchived = false,
    sortField = "createdAt", sortDir = "desc",
  } = options;

  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));
  const from = (safePage - 1) * safeLimit;
  const to = from + safeLimit - 1;

  const dbSortField = ALLOWED_SORT_FIELDS[sortField] ?? "created_at";

  let query = supabase
    .from("leads")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .eq("is_archived", isArchived)
    .order(dbSortField, { ascending: sortDir === "asc" })
    .range(from, to);

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,company.ilike.%${search}%,email.ilike.%${search}%`
    );
  }
  if (status?.length) query = query.in("status", status);
  if (platform?.length) query = query.in("platform", platform);
  if (priority?.length) query = query.in("priority", priority);
  if (response?.length) query = query.in("response", response);
  if (tags?.length) query = query.overlaps("tags", tags);
  if (dateFrom) query = query.gte("created_at", dateFrom);
  if (dateTo) query = query.lte("created_at", dateTo);

  const { data, count, error } = await query;

  if (error) throw new Error(error.message);

  const total = count ?? 0;
  return {
    data: (data ?? []).map(rowToLead),
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit),
  };
}

/** Create a single lead and log its activity. */
export async function createLead(
  userId: string,
  input: unknown
): Promise<{ lead: ILead | null; duplicate: ILead | null; validationError: string | null }> {
  const parsed = createLeadSchema.safeParse(input);
  if (!parsed.success) {
    return { lead: null, duplicate: null, validationError: parsed.error.issues[0]?.message ?? "Validation error" };
  }

  const { email, linkedin } = parsed.data;

  // Duplicate detection
  if (email || linkedin) {
    const orParts: string[] = [];
    if (email) orParts.push(`email.eq.${email}`);
    if (linkedin) orParts.push(`linkedin.eq.${linkedin}`);

    const { data: existing } = await supabase
      .from("leads")
      .select("*")
      .eq("user_id", userId)
      .or(orParts.join(","))
      .maybeSingle();

    if (existing) {
      return { lead: null, duplicate: rowToLead(existing), validationError: null };
    }
  }

  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      user_id: userId,
      name: parsed.data.name,
      company: parsed.data.company ?? null,
      designation: parsed.data.designation ?? null,
      industry: parsed.data.industry ?? null,
      email: parsed.data.email ?? null,
      phone: parsed.data.phone ?? null,
      whatsapp: parsed.data.whatsapp ?? null,
      website: parsed.data.website ?? null,
      linkedin: parsed.data.linkedin ?? null,
      twitter: parsed.data.twitter ?? null,
      instagram: parsed.data.instagram ?? null,
      github: parsed.data.github ?? null,
      portfolio: parsed.data.portfolio ?? null,
      location: parsed.data.location ?? null,
      bio: parsed.data.bio ?? null,
      tags: parsed.data.tags ?? [],
      priority: parsed.data.priority,
      status: parsed.data.status,
      platform: parsed.data.platform,
      response: parsed.data.response,
      budget: parsed.data.budget ?? null,
      expected_revenue: parsed.data.expectedRevenue ?? null,
      project_type: parsed.data.projectType ?? null,
      next_follow_up: parsed.data.nextFollowUp ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Log activity
  await supabase.from("activities").insert({
    user_id: userId,
    lead_id: lead.id,
    type: "lead_created",
    description: `Lead ${lead.name} was created`,
    icon: "user-plus",
  });

  return { lead: rowToLead(lead), duplicate: null, validationError: null };
}

/** Get a single lead by id (scoped to userId). */
export async function getLeadById(id: string, userId: string): Promise<ILead | null> {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? rowToLead(data) : null;
}

/** Update a lead and log the activity. */
export async function updateLead(
  id: string,
  userId: string,
  input: unknown
): Promise<{ lead: ILead | null; validationError: string | null }> {
  const parsed = updateLeadSchema.safeParse(input);
  if (!parsed.success) {
    return { lead: null, validationError: parsed.error.issues[0]?.message ?? "Validation error" };
  }

  // Fetch current lead to detect status change
  const { data: current } = await supabase
    .from("leads")
    .select("status, name")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (!current) return { lead: null, validationError: null };

  const updates: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.company !== undefined) updates.company = parsed.data.company;
  if (parsed.data.designation !== undefined) updates.designation = parsed.data.designation;
  if (parsed.data.industry !== undefined) updates.industry = parsed.data.industry;
  if (parsed.data.email !== undefined) updates.email = parsed.data.email;
  if (parsed.data.phone !== undefined) updates.phone = parsed.data.phone;
  if (parsed.data.whatsapp !== undefined) updates.whatsapp = parsed.data.whatsapp;
  if (parsed.data.website !== undefined) updates.website = parsed.data.website;
  if (parsed.data.linkedin !== undefined) updates.linkedin = parsed.data.linkedin;
  if (parsed.data.twitter !== undefined) updates.twitter = parsed.data.twitter;
  if (parsed.data.instagram !== undefined) updates.instagram = parsed.data.instagram;
  if (parsed.data.github !== undefined) updates.github = parsed.data.github;
  if (parsed.data.portfolio !== undefined) updates.portfolio = parsed.data.portfolio;
  if (parsed.data.location !== undefined) updates.location = parsed.data.location;
  if (parsed.data.bio !== undefined) updates.bio = parsed.data.bio;
  if (parsed.data.tags !== undefined) updates.tags = parsed.data.tags;
  if (parsed.data.priority !== undefined) updates.priority = parsed.data.priority;
  if (parsed.data.status !== undefined) updates.status = parsed.data.status;
  if (parsed.data.platform !== undefined) updates.platform = parsed.data.platform;
  if (parsed.data.response !== undefined) updates.response = parsed.data.response;
  if (parsed.data.budget !== undefined) updates.budget = parsed.data.budget;
  if (parsed.data.expectedRevenue !== undefined) updates.expected_revenue = parsed.data.expectedRevenue;
  if (parsed.data.projectType !== undefined) updates.project_type = parsed.data.projectType;
  if (parsed.data.nextFollowUp !== undefined) updates.next_follow_up = parsed.data.nextFollowUp;

  const { data: lead, error } = await supabase
    .from("leads")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  const previousStatus = current.status;
  if (parsed.data.status && parsed.data.status !== previousStatus) {
    await supabase.from("activities").insert({
      user_id: userId,
      lead_id: id,
      type: "status_changed",
      description: `Status changed from ${previousStatus} to ${parsed.data.status}`,
      icon: "refresh-cw",
      metadata: { from: previousStatus, to: parsed.data.status },
    });
  } else {
    await supabase.from("activities").insert({
      user_id: userId,
      lead_id: id,
      type: "lead_updated",
      description: `Lead ${lead.name} was updated`,
      icon: "pencil",
    });
  }

  return { lead: rowToLead(lead), validationError: null };
}

/** Delete a single lead. */
export async function deleteLead(id: string, userId: string): Promise<boolean> {
  const { error, count } = await supabase
    .from("leads")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}

/** Bulk delete / archive / restore leads. */
export async function bulkLeads(options: BulkLeadsOptions): Promise<void> {
  const { userId, ids, action } = options;

  if (action === "delete") {
    const { error } = await supabase
      .from("leads")
      .delete()
      .in("id", ids)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
  } else if (action === "archive") {
    const { error } = await supabase
      .from("leads")
      .update({ is_archived: true, archived_at: new Date().toISOString() })
      .in("id", ids)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
  } else if (action === "restore") {
    const { error } = await supabase
      .from("leads")
      .update({ is_archived: false, archived_at: null })
      .in("id", ids)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
  }
}

/** Export all user leads as a CSV string. */
export async function exportLeadsCsv(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const leads = (data ?? []).map(rowToLead);

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
export async function importLeadsCsv(options: { userId: string; csvText: string }) {
  const { userId, csvText } = options;

  const lines = csvText.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) throw new Error("CSV must have a header row and at least one data row");

  const columnHeaders = parseCsvRow(lines[0]).map((h) => h.toLowerCase().trim());
  for (const col of ["name", "platform"] as const) {
    if (!columnHeaders.includes(col)) throw new Error(`Missing required column: "${col}"`);
  }

  const results = { created: 0, skipped: 0, errors: [] as string[] };

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvRow(lines[i]);
    const row: Record<string, string> = {};
    columnHeaders.forEach((h, idx) => { row[h] = values[idx] ?? ""; });

    const raw = {
      name: row.name, platform: row.platform,
      company: row.company || undefined, designation: row.designation || undefined,
      industry: row.industry || undefined, email: row.email || undefined,
      phone: row.phone || undefined, website: row.website || undefined,
      linkedin: row.linkedin || undefined, twitter: row.twitter || undefined,
      instagram: row.instagram || undefined, github: row.github || undefined,
      location: row.location || undefined, bio: row.bio || undefined,
      status: row.status || "new", priority: row.priority || "medium",
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
      const orParts: string[] = [];
      if (email) orParts.push(`email.eq.${email}`);
      if (linkedin) orParts.push(`linkedin.eq.${linkedin}`);
      const { data: existing } = await supabase
        .from("leads")
        .select("id")
        .eq("user_id", userId)
        .or(orParts.join(","))
        .maybeSingle();
      if (existing) { results.skipped++; continue; }
    }

    const { error: insertError } = await supabase.from("leads").insert({
      user_id: userId,
      name: parsed.data.name,
      company: parsed.data.company ?? null,
      designation: parsed.data.designation ?? null,
      industry: parsed.data.industry ?? null,
      email: parsed.data.email ?? null,
      phone: parsed.data.phone ?? null,
      website: parsed.data.website ?? null,
      linkedin: parsed.data.linkedin ?? null,
      twitter: parsed.data.twitter ?? null,
      instagram: parsed.data.instagram ?? null,
      github: parsed.data.github ?? null,
      location: parsed.data.location ?? null,
      bio: parsed.data.bio ?? null,
      tags: parsed.data.tags ?? [],
      priority: parsed.data.priority,
      status: parsed.data.status,
      platform: parsed.data.platform,
      response: parsed.data.response,
      budget: parsed.data.budget ?? null,
      expected_revenue: parsed.data.expectedRevenue ?? null,
      project_type: parsed.data.projectType ?? null,
      next_follow_up: parsed.data.nextFollowUp ?? null,
    });

    if (insertError) {
      results.errors.push(`Row ${i}: ${insertError.message}`);
      results.skipped++;
    } else {
      results.created++;
    }
  }

  return results;
}
