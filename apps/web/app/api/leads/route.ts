import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { supabase } from "@outreach/database/client";
import { createLeadSchema } from "@outreach/shared";
import { resolveUser } from "@outreach/server/api-key-auth";
import type { ApiResponse, PaginatedResponse, ILead } from "@outreach/shared";

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await resolveUser(headersList);
    if (!session) return Response.json({ success: false, error: "Unauthorized" } satisfies ApiResponse, { status: 401 });

    const userId = session.id;
    const { searchParams } = request.nextUrl;

    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const search = searchParams.get("search");
    const status = searchParams.getAll("status");
    const platform = searchParams.getAll("platform");
    const priority = searchParams.getAll("priority");
    const response = searchParams.getAll("response");
    const tags = searchParams.getAll("tags");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const isArchived = searchParams.get("isArchived") === "true";
    const sortField = searchParams.get("sortField") ?? "created_at";
    const sortDir = searchParams.get("sortDir") !== "asc";

    const SORT_MAP: Record<string, string> = {
      createdAt: "created_at", updatedAt: "updated_at",
      name: "name", status: "status", priority: "priority", platform: "platform",
    };
    const dbSort = SORT_MAP[sortField] ?? "created_at";

    let query = supabase
      .from("leads")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .eq("is_archived", isArchived)
      .order(dbSort, { ascending: !sortDir })
      .range(from, to);

    if (search) query = query.or(`name.ilike.%${search}%,company.ilike.%${search}%,email.ilike.%${search}%`);
    if (status.length) query = query.in("status", status as never);
    if (platform.length) query = query.in("platform", platform as never);
    if (priority.length) query = query.in("priority", priority as never);
    if (response.length) query = query.in("response", response as never);
    if (tags.length) query = query.overlaps("tags", tags);
    if (dateFrom) query = query.gte("created_at", dateFrom);
    if (dateTo) query = query.lte("created_at", dateTo);

    const { data, count, error } = await query;
    if (error) throw error;

    const result: PaginatedResponse<ILead> = {
      data: (data ?? []) as unknown as ILead[],
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.ceil((count ?? 0) / limit),
    };

    return Response.json({ success: true, data: result } satisfies ApiResponse<PaginatedResponse<ILead>>);
  } catch (error) {
    console.error("[leads] GET error:", error);
    return Response.json({ success: false, error: "Internal server error" } satisfies ApiResponse, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await resolveUser(headersList);
    if (!session) return Response.json({ success: false, error: "Unauthorized" } satisfies ApiResponse, { status: 401 });

    const userId = session.id;
    const body = await request.json();
    const parsed = createLeadSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ success: false, error: parsed.error.issues[0]?.message ?? "Validation error" } satisfies ApiResponse, { status: 400 });
    }

    const { email, linkedin } = parsed.data;
    if (email || linkedin) {
      const orParts: string[] = [];
      if (email) orParts.push(`email.eq.${email}`);
      if (linkedin) orParts.push(`linkedin.eq.${linkedin}`);
      const { data: existing } = await supabase.from("leads").select("*").eq("user_id", userId).or(orParts.join(",")).maybeSingle();
      if (existing) {
        return Response.json({ success: false, error: "duplicate", data: existing, message: "A lead with this email or LinkedIn already exists" }, { status: 409 });
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

    if (error) throw error;

    await supabase.from("activities").insert({ user_id: userId, lead_id: lead.id, type: "lead_created", description: `Lead ${lead.name} was created`, icon: "user-plus" });

    return Response.json({ success: true, data: lead as unknown as ILead, message: "Lead created" } satisfies ApiResponse<ILead>, { status: 201 });
  } catch (error) {
    console.error("[leads] POST error:", error);
    return Response.json({ success: false, error: "Internal server error" } satisfies ApiResponse, { status: 500 });
  }
}
