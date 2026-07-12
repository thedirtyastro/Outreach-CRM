import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@outreach/server/auth";
import { supabase } from "@outreach/database/client";
import type { ApiResponse } from "@outreach/shared";

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session?.user) {
      return Response.json({ success: false, error: "Unauthorized" } satisfies ApiResponse, { status: 401 });
    }

    const { id } = await params;

    const { error, count } = await supabase
      .from("templates")
      .delete({ count: "exact" })
      .eq("id", id)
      .eq("user_id", session.user.id);

    if (error) throw error;
    if (!count) {
      return Response.json({ success: false, error: "Template not found" } satisfies ApiResponse, { status: 404 });
    }

    return Response.json({ success: true, message: "Template deleted" } satisfies ApiResponse);
  } catch (error) {
    console.error("[templates/[id]] DELETE error:", error);
    return Response.json({ success: false, error: "Internal server error" } satisfies ApiResponse, { status: 500 });
  }
}
