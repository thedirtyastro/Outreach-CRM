import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@outreach/server/auth";
import { connectDB, Lead } from "@outreach/database";
import type { ILead } from "@outreach/shared";

/** GET /api/leads/export — download all user leads as CSV */
export async function GET(request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    await connectDB();
    const userId = session.user.id;

    const leads = (await Lead.find({ userId })
      .sort({ createdAt: -1 })
      .lean()) as unknown as ILead[];

    const CSV_HEADERS = [
      "name", "company", "designation", "industry",
      "email", "phone", "website", "linkedin", "twitter",
      "instagram", "github", "location", "platform",
      "status", "priority", "response", "budget",
      "expectedRevenue", "projectType", "tags",
      "bio", "score", "nextFollowUp", "createdAt",
    ];

    function escapeCsv(value: unknown): string {
      if (value == null) return "";
      const str = Array.isArray(value) ? value.join("; ") : String(value);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }

    const rows = leads.map((l) =>
      CSV_HEADERS.map((h) => escapeCsv(l[h as keyof ILead])).join(",")
    );

    const csv = [CSV_HEADERS.join(","), ...rows].join("\n");
    const filename = `leads-export-${new Date().toISOString().split("T")[0]}.csv`;

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[leads/export] GET error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
