import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@outreach/server/auth";
import { supabase } from "@outreach/database/client";

function escapeCsv(value: unknown): string {
  if (value == null) return "";
  const str = Array.isArray(value) ? value.join("; ") : String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

const CSV_HEADERS = [
  "name", "company", "designation", "industry", "email", "phone",
  "website", "linkedin", "twitter", "instagram", "github", "location",
  "platform", "status", "priority", "response", "budget",
  "expected_revenue", "project_type", "tags", "bio", "score",
  "next_follow_up", "created_at",
];

export async function GET(_request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session?.user) return new Response("Unauthorized", { status: 401 });

    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const rows = (data ?? []).map((l) =>
      CSV_HEADERS.map((h) => escapeCsv(l[h as keyof typeof l])).join(",")
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
