import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@outreach/server/auth";
import { supabase } from "@outreach/database/client";
import type { ApiResponse } from "@outreach/shared";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session?.user) return Response.json({ success: false, error: "Unauthorized" } satisfies ApiResponse, { status: 401 });

    const { id } = await params;
    const userId = session.user.id;
    const body = await request.json();

    const updates: Record<string, unknown> = {};
    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.dueDate !== undefined) updates.due_date = body.dueDate;
    if (body.status !== undefined) {
      updates.status = body.status;
      if (body.status === "completed") updates.completed_at = new Date().toISOString();
    }
    if (body.isRecurring !== undefined) updates.is_recurring = body.isRecurring;
    if (body.recurringInterval !== undefined) updates.recurring_interval = body.recurringInterval;
    if (body.recurringUnit !== undefined) updates.recurring_unit = body.recurringUnit;

    const { data, error } = await supabase.from("follow_ups").update(updates as never).eq("id", id).eq("user_id", userId).select().single();
    if (error) throw error;
    if (!data) return Response.json({ success: false, error: "Follow-up not found" } satisfies ApiResponse, { status: 404 });

    if (body.status === "completed") {
      await supabase.from("activities").insert({
        user_id: userId,
        lead_id: (data as Record<string, unknown>).lead_id as string,
        type: "follow_up_completed" as const,
        description: `Follow-up completed: ${(data as Record<string, unknown>).title}`,
        icon: "check-circle",
      } as never);
    }

    return Response.json({ success: true, data } satisfies ApiResponse);
  } catch (error) {
    console.error("[followups/[id]] PATCH error:", error);
    return Response.json({ success: false, error: "Internal server error" } satisfies ApiResponse, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session?.user) return Response.json({ success: false, error: "Unauthorized" } satisfies ApiResponse, { status: 401 });

    const { id } = await params;
    const { error, count } = await supabase.from("follow_ups").delete({ count: "exact" }).eq("id", id).eq("user_id", session.user.id);
    if (error) throw error;
    if (!count) return Response.json({ success: false, error: "Follow-up not found" } satisfies ApiResponse, { status: 404 });

    return Response.json({ success: true, message: "Follow-up deleted" } satisfies ApiResponse);
  } catch (error) {
    console.error("[followups/[id]] DELETE error:", error);
    return Response.json({ success: false, error: "Internal server error" } satisfies ApiResponse, { status: 500 });
  }
}
