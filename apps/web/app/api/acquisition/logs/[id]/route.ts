import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { resolveUser } from "@outreach/server/api-key-auth";
import { updateOutreachLog, deleteOutreachLog } from "@outreach/server/services/acquisition.service";
import { outreachLogSchema } from "@outreach/shared";
import type { ApiResponse, IOutreachLog } from "@outreach/shared";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const headersList = await headers();
    const user = await resolveUser(headersList);
    if (!user) {
      return Response.json(
        { success: false, error: "Unauthorized" } satisfies ApiResponse,
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = outreachLogSchema.partial().safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Validation error" } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const log = await updateOutreachLog(id, user.id, parsed.data);
    if (!log) {
      return Response.json(
        { success: false, error: "Log not found" } satisfies ApiResponse,
        { status: 404 }
      );
    }

    return Response.json(
      { success: true, data: log } satisfies ApiResponse<IOutreachLog>
    );
  } catch (error) {
    console.error("[acquisition/logs/[id]] PUT error:", error);
    return Response.json(
      { success: false, error: "Internal server error" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const headersList = await headers();
    const user = await resolveUser(headersList);
    if (!user) {
      return Response.json(
        { success: false, error: "Unauthorized" } satisfies ApiResponse,
        { status: 401 }
      );
    }

    const { id } = await params;
    const deleted = await deleteOutreachLog(id, user.id);
    if (!deleted) {
      return Response.json(
        { success: false, error: "Log not found" } satisfies ApiResponse,
        { status: 404 }
      );
    }

    return Response.json(
      { success: true, message: "Log deleted" } satisfies ApiResponse
    );
  } catch (error) {
    console.error("[acquisition/logs/[id]] DELETE error:", error);
    return Response.json(
      { success: false, error: "Internal server error" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
