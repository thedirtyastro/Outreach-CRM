import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { resolveUser } from "@outreach/server/api-key-auth";
import { getAcquisitionAnalytics } from "@outreach/server/services/acquisition.service";
import { analyticsQuerySchema } from "@outreach/shared";
import type { ApiResponse } from "@outreach/shared";

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers();
    const user = await resolveUser(headersList);
    if (!user) {
      return Response.json(
        { success: false, error: "Unauthorized" } satisfies ApiResponse,
        { status: 401 }
      );
    }

    const { searchParams } = request.nextUrl;
    const rangeParsed = analyticsQuerySchema.safeParse({
      range: searchParams.get("range"),
    });

    if (!rangeParsed.success) {
      return Response.json(
        { success: false, error: "Invalid range. Must be one of: 7d, 30d, 90d, this_month" } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const data = await getAcquisitionAnalytics(user.id, rangeParsed.data.range);
    return Response.json({ success: true, data } satisfies ApiResponse);
  } catch (error) {
    console.error("[acquisition/analytics] GET error:", error);
    return Response.json(
      { success: false, error: "Internal server error" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
