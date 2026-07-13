import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { resolveUser } from "@outreach/server/api-key-auth";
import { getGoalForDate, upsertGoal } from "@outreach/server/services/acquisition.service";
import { goalFormSchema } from "@outreach/shared";
import type { ApiResponse, IAcquisitionGoal } from "@outreach/shared";

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
    const date = searchParams.get("date") ?? new Date().toISOString().split("T")[0];

    const goal = await getGoalForDate(user.id, date);
    return Response.json(
      { success: true, data: goal } satisfies ApiResponse<IAcquisitionGoal | null>
    );
  } catch (error) {
    console.error("[acquisition/goals] GET error:", error);
    return Response.json(
      { success: false, error: "Internal server error" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const user = await resolveUser(headersList);
    if (!user) {
      return Response.json(
        { success: false, error: "Unauthorized" } satisfies ApiResponse,
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = goalFormSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Validation error" } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const goal = await upsertGoal(user.id, parsed.data);
    return Response.json(
      { success: true, data: goal, message: "Goal saved" } satisfies ApiResponse<IAcquisitionGoal>,
      { status: 201 }
    );
  } catch (error) {
    console.error("[acquisition/goals] POST error:", error);
    return Response.json(
      { success: false, error: "Internal server error" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
