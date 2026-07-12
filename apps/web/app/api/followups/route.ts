import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@outreach/server/auth";
import { supabase } from "@outreach/database/client";
import { createFollowUpSchema } from "@outreach/shared";
import type { ApiResponse, PaginatedResponse, IFollowUp } from "@outreach/shared";

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToFollowUp(r: any): IFollowUp {
  return {
    id: r.id, userId: r.user_id, leadId: r.lead_id,
    title: r.title, description: r.description ?? undefined,
    dueDate: r.due_date, status: r.status,
    isRecurring: r.is_recurring ?? false,
    recurringInterval: r.recurring_interval ?? undefined,
    recurringUnit: r.recurring_unit ?? undefined,
    completedAt: r.completed_at ?? undefined,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session?.user) return Response.json({ success: false, error: "Unauthorized" } satisfies ApiResponse, { status: 401 });

    const userId = session.user.id;
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20", 10));
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const status = searchParams.getAll("status");
    const leadId = searchParams.get("leadId");

    let query = supabase.from("follow_ups").select("*", { count: "exact" }).eq("user_id", userId).order("due_date", { ascending: true }).range(from, to);
    if (status.length) query = query.in("status", status as never);
    if (leadId) query = query.eq("lead_id", leadId);

    const { data, count, error } = await query;
    if (error) throw error;

    const result: PaginatedResponse<IFollowUp> = { data: (data ?? []).map(rowToFollowUp), total: count ?? 0, page, limit, totalPages: Math.ceil((count ?? 0) / limit) };
    return Response.json({ success: true, data: result } satisfies ApiResponse<PaginatedResponse<IFollowUp>>);
  } catch (error) {
    console.error("[followups] GET error:", error);
    return Response.json({ success: false, error: "Internal server error" } satisfies ApiResponse, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session?.user) return Response.json({ success: false, error: "Unauthorized" } satisfies ApiResponse, { status: 401 });

    const userId = session.user.id;
    const body = await request.json();
    const parsed = createFollowUpSchema.safeParse(body);
    if (!parsed.success) return Response.json({ success: false, error: parsed.error.issues[0]?.message ?? "Validation error" } satisfies ApiResponse, { status: 400 });

    const { data: followUp, error } = await supabase.from("follow_ups").insert({
      user_id: userId, lead_id: parsed.data.leadId, title: parsed.data.title,
      description: parsed.data.description ?? null, due_date: parsed.data.dueDate,
      is_recurring: parsed.data.isRecurring, recurring_interval: parsed.data.recurringInterval ?? null,
      recurring_unit: parsed.data.recurringUnit ?? null,
    }).select().single();

    if (error) throw error;

    await supabase.from("activities").insert({ user_id: userId, lead_id: parsed.data.leadId, type: "follow_up_created", description: `Follow-up scheduled: ${parsed.data.title}`, icon: "calendar-plus" });

    return Response.json({ success: true, data: rowToFollowUp(followUp), message: "Follow-up created" } satisfies ApiResponse<IFollowUp>, { status: 201 });
  } catch (error) {
    console.error("[followups] POST error:", error);
    return Response.json({ success: false, error: "Internal server error" } satisfies ApiResponse, { status: 500 });
  }
}
