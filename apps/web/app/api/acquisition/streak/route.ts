import { headers } from "next/headers";
import { resolveUser } from "@outreach/server/api-key-auth";
import { getStreakData } from "@outreach/server/services/acquisition.service";
import type { ApiResponse, StreakData } from "@outreach/shared";

export async function GET() {
  try {
    const headersList = await headers();
    const user = await resolveUser(headersList);
    if (!user) {
      return Response.json(
        { success: false, error: "Unauthorized" } satisfies ApiResponse,
        { status: 401 }
      );
    }

    const data = await getStreakData(user.id);
    return Response.json(
      { success: true, data } satisfies ApiResponse<StreakData>
    );
  } catch (error) {
    console.error("[acquisition/streak] GET error:", error);
    return Response.json(
      { success: false, error: "Internal server error" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
