import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@outreach/server/auth";
import { connectDB, Lead } from "@outreach/database";
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

/** POST /api/leads/import — bulk create leads from CSV body */
export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session?.user) {
      return Response.json({ success: false, error: "Unauthorized" } satisfies ApiResponse, { status: 401 });
    }

    const text = await request.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim());

    if (lines.length < 2) {
      return Response.json({ success: false, error: "CSV must have a header row and at least one data row" } satisfies ApiResponse, { status: 400 });
    }

    const columnHeaders = parseCsvRow(lines[0]).map((h) => h.toLowerCase().trim());

    for (const col of REQUIRED_COLS) {
      if (!columnHeaders.includes(col)) {
        return Response.json(
          { success: false, error: `Missing required column: "${col}"` } satisfies ApiResponse,
          { status: 400 }
        );
      }
    }

    await connectDB();
    const userId = session.user.id;

    const results = { created: 0, skipped: 0, errors: [] as string[] };

    for (let i = 1; i < lines.length; i++) {
      const values = parseCsvRow(lines[i]);
      const row: Record<string, string> = {};
      columnHeaders.forEach((h, idx) => {
        row[h] = values[idx] ?? "";
      });

      // Build a lead object from the row
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

      // Duplicate check
      const { email, linkedin } = parsed.data;
      if (email || linkedin) {
        const orConditions = [];
        if (email) orConditions.push({ email, userId });
        if (linkedin) orConditions.push({ linkedin, userId });
        const existing = await Lead.findOne({ $or: orConditions }).lean();
        if (existing) {
          results.skipped++;
          continue;
        }
      }

      await Lead.create({ ...parsed.data, userId });
      results.created++;
    }

    return Response.json({
      success: true,
      data: results,
      message: `Imported ${results.created} leads. Skipped ${results.skipped}.`,
    } satisfies ApiResponse);
  } catch (error) {
    console.error("[leads/import] POST error:", error);
    return Response.json({ success: false, error: "Internal server error" } satisfies ApiResponse, { status: 500 });
  }
}
