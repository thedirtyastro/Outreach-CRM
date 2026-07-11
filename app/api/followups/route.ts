import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { connectDB, FollowUp, Activity } from "@/database";
import { createFollowUpSchema } from "@/lib/validations";
import type { ApiResponse, PaginatedResponse } from "@/types";
import type { IFollowUp } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session?.user) {
      return Response.json({ success: false, error: "Unauthorized" } satisfies ApiResponse, { status: 401 });
    }

    await connectDB();
    const userId = session.user.id;
    const { searchParams } = request.nextUrl;

    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20", 10));
    const skip = (page - 1) * limit;
    const status = searchParams.getAll("status");
    const leadId = searchParams.get("leadId");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = { userId };
    if (status.length > 0) query.status = { $in: status };
    if (leadId) query.leadId = leadId;

    const [data, total] = await Promise.all([
      FollowUp.find(query).sort({ dueDate: 1 }).skip(skip).limit(limit).lean(),
      FollowUp.countDocuments(query),
    ]);

    const result: PaginatedResponse<IFollowUp> = {
      data: data as unknown as IFollowUp[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

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
    if (!session?.user) {
      return Response.json({ success: false, error: "Unauthorized" } satisfies ApiResponse, { status: 401 });
    }

    await connectDB();
    const userId = session.user.id;
    const body = await request.json();

    const parsed = createFollowUpSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { success: false, error: parsed.error.errors[0]?.message ?? "Validation error" } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const followUp = await FollowUp.create({ ...parsed.data, userId });

    await Activity.create({
      userId,
      leadId: parsed.data.leadId,
      type: "follow_up_created",
      description: `Follow-up scheduled: ${parsed.data.title}`,
      icon: "calendar-plus",
    });

    return Response.json(
      { success: true, data: followUp.toJSON(), message: "Follow-up created" } satisfies ApiResponse<IFollowUp>,
      { status: 201 }
    );
  } catch (error) {
    console.error("[followups] POST error:", error);
    return Response.json({ success: false, error: "Internal server error" } satisfies ApiResponse, { status: 500 });
  }
}
