import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@outreach/database/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "20", 10);
    const search = searchParams.get("search") ?? "";
    const sortField = searchParams.get("sortField") ?? "created_at";
    const sortDir = (searchParams.get("sortDir") ?? "desc") as "asc" | "desc";

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("user")
      .select("*", { count: "exact" })
      .order(sortField, { ascending: sortDir === "asc" })
      .range(from, to);

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, count, error } = await query;

    if (error) throw new Error(error.message);

    type UserRow = { id: string; name: string; email: string; image?: string | null; email_verified: boolean; created_at: string; updated_at: string };

    // Enrich users with stats
    const enrichedUsers = await Promise.all(
      ((data ?? []) as UserRow[]).map(async (user) => {
        const { count: leadsCount } = await supabase
          .from("leads")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        const { count: emailsCount } = await supabase
          .from("emails")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", "sent");

        return {
          ...user,
          leads_count: leadsCount ?? 0,
          emails_sent: emailsCount ?? 0,
        };
      })
    );

    return NextResponse.json({
      users: enrichedUsers,
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.ceil((count ?? 0) / limit),
    });
  } catch (error) {
    console.error("[admin/users] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
