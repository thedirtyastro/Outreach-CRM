import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@outreach/server/auth";
import { connectDB, Activity } from "@outreach/database";
import type { ApiResponse, PaginatedResponse } from "@outreach/shared";
import type { IActivity } from "@outreach/shared";

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
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
    const skip = (page - 1) * limit;
    const leadId = searchParams.get("leadId");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = { userId };
    if (leadId) query.leadId = leadId;

    const [data, total] = await Promise.all([
      Activity.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Activity.countDocuments(query),
    ]);

    const result: PaginatedResponse<IActivity> = {
      data: data as unknown as IActivity[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    return Response.json({ success: true, data: result } satisfies ApiResponse<PaginatedResponse<IActivity>>);
  } catch (error) {
    console.error("[activities] GET error:", error);
    return Response.json({ success: false, error: "Internal server error" } satisfies ApiResponse, { status: 500 });
  }
}
