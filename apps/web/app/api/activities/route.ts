import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth, listActivities } from "@outreach/server";
import type { ApiResponse, PaginatedResponse, IActivity } from "@outreach/shared";

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session?.user) {
      return Response.json({ success: false, error: "Unauthorized" } satisfies ApiResponse, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = request.nextUrl;

    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
    const leadId = searchParams.get("leadId") || undefined;

    const result = await listActivities({
      userId,
      leadId,
      page,
      limit,
    });

    return Response.json({ success: true, data: result } satisfies ApiResponse<PaginatedResponse<IActivity>>);
  } catch (error) {
    console.error("[activities] GET error:", error);
    return Response.json({ success: false, error: "Internal server error" } satisfies ApiResponse, { status: 500 });
  }
}
