import { NextRequest, NextResponse } from "next/server";
import { auth, getAnalytics } from "@outreach/server";
import type { AnalyticsRange } from "@outreach/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = (searchParams.get("range") || "30d") as AnalyticsRange;

    const analytics = await getAnalytics(session.user.id, range);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
