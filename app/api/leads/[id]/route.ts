import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { connectDB, Lead, Activity } from "@/database";
import { updateLeadSchema } from "@/lib/validations";
import type { ApiResponse } from "@/types";
import type { ILead } from "@/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session?.user) {
      return Response.json({ success: false, error: "Unauthorized" } satisfies ApiResponse, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const lead = await Lead.findOne({ _id: id, userId: session.user.id }).lean();

    if (!lead) {
      return Response.json({ success: false, error: "Lead not found" } satisfies ApiResponse, { status: 404 });
    }

    return Response.json({ success: true, data: lead } satisfies ApiResponse<ILead>);
  } catch (error) {
    console.error("[leads/[id]] GET error:", error);
    return Response.json({ success: false, error: "Internal server error" } satisfies ApiResponse, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session?.user) {
      return Response.json({ success: false, error: "Unauthorized" } satisfies ApiResponse, { status: 401 });
    }

    await connectDB();
    const userId = session.user.id;
    const { id } = await params;
    const body = await request.json();

    const parsed = updateLeadSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { success: false, error: parsed.error.errors[0]?.message ?? "Validation error" } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const lead = await Lead.findOne({ _id: id, userId });
    if (!lead) {
      return Response.json({ success: false, error: "Lead not found" } satisfies ApiResponse, { status: 404 });
    }

    const previousStatus = lead.status;
    Object.assign(lead, parsed.data);
    await lead.save();

    // Log status change
    if (parsed.data.status && parsed.data.status !== previousStatus) {
      await Activity.create({
        userId,
        leadId: id,
        type: "status_changed",
        description: `Status changed from ${previousStatus} to ${parsed.data.status}`,
        icon: "refresh-cw",
        metadata: { from: previousStatus, to: parsed.data.status },
      });
    } else {
      await Activity.create({
        userId,
        leadId: id,
        type: "lead_updated",
        description: `Lead ${lead.name} was updated`,
        icon: "pencil",
      });
    }

    return Response.json({ success: true, data: lead.toJSON() } satisfies ApiResponse<ILead>);
  } catch (error) {
    console.error("[leads/[id]] PATCH error:", error);
    return Response.json({ success: false, error: "Internal server error" } satisfies ApiResponse, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session?.user) {
      return Response.json({ success: false, error: "Unauthorized" } satisfies ApiResponse, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const lead = await Lead.findOneAndDelete({ _id: id, userId: session.user.id });

    if (!lead) {
      return Response.json({ success: false, error: "Lead not found" } satisfies ApiResponse, { status: 404 });
    }

    return Response.json({ success: true, message: "Lead deleted" } satisfies ApiResponse);
  } catch (error) {
    console.error("[leads/[id]] DELETE error:", error);
    return Response.json({ success: false, error: "Internal server error" } satisfies ApiResponse, { status: 500 });
  }
}
