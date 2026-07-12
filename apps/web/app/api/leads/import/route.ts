import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@outreach/server/auth";
import { supabase } from "@outreach/database/client";
import { createLeadSchema } from "@outreach/shared";
import type { ApiResponse } from "@outreach/shared";

const REQUIRED_COLS = ["name", "platform"] as const;

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

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session?.user) return Response.json({ success: false, error: "Unauthorized" } satisfies ApiResponse, { status: 401 });

    const text = await request.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) return Response.json({ success: false, error: "CSV must have a header row and at least one data row" } satisfies ApiResponse, { status: 400 });

    const columnHeaders = parseCsvRow(lines[0]).map((h) => h.toLowerCase().trim());
    for (const col of REQUIRED_COLS) {
      if (!columnHeaders.includes(col)) return Response.json({ success: false, error: `Missing required column: "${col}"` } satisfies ApiResponse, { status: 400 });
    }

    const userId = session.user.id;
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
        const { data: existing } = await supabase.from("leads").select("id").eq("user_id", userId).or(orParts.join(",")).maybeSingle();
        if (existing) { results.skipped++; continue; }
      }

      const { error: insertError } = await supabase.from("leads").insert({
        user_id: userId,
        name: parsed.data.name, company: parsed.data.company ?? null,
        designation: parsed.data.designation ?? null, industry: parsed.data.industry ?? null,
        email: parsed.data.email ?? null, phone: parsed.data.phone ?? null,
        website: parsed.data.website ?? null, linkedin: parsed.data.linkedin ?? null,
        twitter: parsed.data.twitter ?? null, instagram: parsed.data.instagram ?? null,
        github: parsed.data.github ?? null, location: parsed.data.location ?? null,
        bio: parsed.data.bio ?? null, tags: parsed.data.tags ?? [],
        priority: parsed.data.priority, status: parsed.data.status,
        platform: parsed.data.platform, response: parsed.data.response,
        budget: parsed.data.budget ?? null, expected_revenue: parsed.data.expectedRevenue ?? null,
        project_type: parsed.data.projectType ?? null, next_follow_up: parsed.data.nextFollowUp ?? null,
      });

      if (insertError) { results.errors.push(`Row ${i}: ${insertError.message}`); results.skipped++; }
      else results.created++;
    }

    return Response.json({ success: true, data: results, message: `Imported ${results.created} leads. Skipped ${results.skipped}.` } satisfies ApiResponse);
  } catch (error) {
    console.error("[leads/import] POST error:", error);
    return Response.json({ success: false, error: "Internal server error" } satisfies ApiResponse, { status: 500 });
  }
}
