import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { resolveUser } from "@outreach/server/api-key-auth";
import { createOutreachLog, listOutreachLogs } from "@outreach/server/services/acquisition.service";
import { outreachLogSchema, logsQuerySchema } from "@outreach/shared";
import type { ApiResponse, IOutreachLog, PaginatedResponse } from "@outreach/shared";

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
    const queryParsed = logsQuerySchema.safeParse({
      page: searchParams.get("page") ?? "1",
      limit: searchParams.get("limit") ?? "20",
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
      platform: searchParams.get("platform") ?? undefined,
    });

    if (!queryParsed.success) {
      return Response.json(
        { success: false, error: queryParsed.error.issues[0]?.message ?? "Invalid query" } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const result = await listOutreachLogs({
      userId: user.id,
      ...queryParsed.data,
    });

    return Response.json(
      { success: true, data: result } satisfies ApiResponse<PaginatedResponse<IOutreachLog>>
    );
  } catch (error) {
    console.error("[acquisition/logs] GET error:", error);
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
    const parsed = outreachLogSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Validation error" } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const log = await createOutreachLog(user.id, parsed.data);
    return Response.json(
      { success: true, data: log, message: "Outreach logged" } satisfies ApiResponse<IOutreachLog>,
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Lead not found" ? 400 : 500;
    console.error("[acquisition/logs] POST error:", error);
    return Response.json(
      { success: false, error: message } satisfies ApiResponse,
      { status }
    );
  }
}
