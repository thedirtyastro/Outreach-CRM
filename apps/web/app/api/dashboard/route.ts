import { NextRequest } from "next/server";
import { auth, getDashboardStats } from "@outreach/server";
import type { ApiResponse } from "@outreach/shared";
import { headers } from "next/headers";

export async function GET(_req: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session?.user) {
      return Response.json({ success: false, error: "Unauthorized" } satisfies ApiResponse, { status: 401 });
    }

    const stats = await getDashboardStats(session.user.id);

    return Response.json({ success: true, data: stats } satisfies ApiResponse<typeof stats>);
  } catch (error) {
    console.error("[dashboard/route] GET error:", error);
    return Response.json(
      { success: false, error: "Internal server error" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
