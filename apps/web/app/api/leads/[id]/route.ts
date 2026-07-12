import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@outreach/server/auth";
import { supabase } from "@outreach/database/client";
import { updateLeadSchema } from "@outreach/shared";
import type { ApiResponse, ILead } from "@outreach/shared";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session?.user) return Response.json({ success: false, error: "Unauthorized" } satisfies ApiResponse, { status: 401 });

    const { id } = await params;
    const { data, error } = await supabase.from("leads").select("*").eq("id", id).eq("user_id", session.user.id).maybeSingle();
    if (error) throw error;
    if (!data) return Response.json({ success: false, error: "Lead not found" } satisfies ApiResponse, { status: 404 });

    return Response.json({ success: true, data: data as unknown as ILead } satisfies ApiResponse<ILead>);
  } catch (error) {
    console.error("[leads/[id]] GET error:", error);
    return Response.json({ success: false, error: "Internal server error" } satisfies ApiResponse, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session?.user) return Response.json({ success: false, error: "Unauthorized" } satisfies ApiResponse, { status: 401 });

    const { id } = await params;
    const userId = session.user.id;
    const body = await request.json();

    const parsed = updateLeadSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ success: false, error: parsed.error.issues[0]?.message ?? "Validation error" } satisfies ApiResponse, { status: 400 });
    }

    const { data: current } = await supabase.from("leads").select("status, name").eq("id", id).eq("user_id", userId).maybeSingle();
    if (!current) return Response.json({ success: false, error: "Lead not found" } satisfies ApiResponse, { status: 404 });

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

    const { data: lead, error } = await supabase.from("leads").update(updates).eq("id", id).eq("user_id", userId).select().single();
    if (error) throw error;

    const previousStatus = current.status;
    if (parsed.data.status && parsed.data.status !== previousStatus) {
      await supabase.from("activities").insert({ user_id: userId, lead_id: id, type: "status_changed", description: `Status changed from ${previousStatus} to ${parsed.data.status}`, icon: "refresh-cw", metadata: { from: previousStatus, to: parsed.data.status } });
    } else {
      await supabase.from("activities").insert({ user_id: userId, lead_id: id, type: "lead_updated", description: `Lead ${lead.name} was updated`, icon: "pencil" });
    }

    return Response.json({ success: true, data: lead as unknown as ILead } satisfies ApiResponse<ILead>);
  } catch (error) {
    console.error("[leads/[id]] PATCH error:", error);
    return Response.json({ success: false, error: "Internal server error" } satisfies ApiResponse, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session?.user) return Response.json({ success: false, error: "Unauthorized" } satisfies ApiResponse, { status: 401 });

    const { id } = await params;
    const { error, count } = await supabase.from("leads").delete({ count: "exact" }).eq("id", id).eq("user_id", session.user.id);
    if (error) throw error;
    if (!count) return Response.json({ success: false, error: "Lead not found" } satisfies ApiResponse, { status: 404 });

    return Response.json({ success: true, message: "Lead deleted" } satisfies ApiResponse);
  } catch (error) {
    console.error("[leads/[id]] DELETE error:", error);
    return Response.json({ success: false, error: "Internal server error" } satisfies ApiResponse, { status: 500 });
  }
}
