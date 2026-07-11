import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { connectDB, FollowUp, Activity } from "@/database";
import type { ApiResponse } from "@/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session?.user) {
      return Response.json({ success: false, error: "Unauthorized" } satisfies ApiResponse, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const userId = session.user.id;
    const body = await request.json();

    const followUp = await FollowUp.findOne({ _id: id, userId });
    if (!followUp) {
      return Response.json({ success: false, error: "Follow-up not found" } satisfies ApiResponse, { status: 404 });
    }

    const { status } = body;
    if (status) {
      followUp.status = status;
      if (status === "completed") {
        followUp.completedAt = new Date();
        await Activity.create({
          userId,
          leadId: followUp.leadId,
          type: "follow_up_completed",
          description: `Follow-up completed: ${followUp.title}`,
          icon: "check-circle",
        });
      }
    }

    Object.assign(followUp, body);
    await followUp.save();

    return Response.json({ success: true, data: followUp.toJSON() } satisfies ApiResponse);
  } catch (error) {
    console.error("[followups/[id]] PATCH error:", error);
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
    const followUp = await FollowUp.findOneAndDelete({ _id: id, userId: session.user.id });

    if (!followUp) {
      return Response.json({ success: false, error: "Follow-up not found" } satisfies ApiResponse, { status: 404 });
    }

    return Response.json({ success: true, message: "Follow-up deleted" } satisfies ApiResponse);
  } catch (error) {
    console.error("[followups/[id]] DELETE error:", error);
    return Response.json({ success: false, error: "Internal server error" } satisfies ApiResponse, { status: 500 });
  }
}
