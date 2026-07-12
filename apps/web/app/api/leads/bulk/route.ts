import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@outreach/server/auth";
import { supabase } from "@outreach/database/client";
import type { ApiResponse } from "@outreach/shared";

const bulkSchema = z.object({
  ids: z.array(z.string()).min(1),
  action: z.enum(["delete", "archive", "restore"]),
});

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session?.user) return Response.json({ success: false, error: "Unauthorized" } satisfies ApiResponse, { status: 401 });

    const userId = session.user.id;
    const body = await request.json();
    const parsed = bulkSchema.safeParse(body);
    if (!parsed.success) return Response.json({ success: false, error: "Invalid request" } satisfies ApiResponse, { status: 400 });

    const { ids, action } = parsed.data;

    if (action === "delete") {
      const { error } = await supabase.from("leads").delete().in("id", ids).eq("user_id", userId);
      if (error) throw error;
    } else if (action === "archive") {
      const { error } = await supabase.from("leads").update({ is_archived: true, archived_at: new Date().toISOString() }).in("id", ids).eq("user_id", userId);
      if (error) throw error;
    } else if (action === "restore") {
      const { error } = await supabase.from("leads").update({ is_archived: false, archived_at: null }).in("id", ids).eq("user_id", userId);
      if (error) throw error;
    }

    return Response.json({ success: true, message: `Bulk ${action} completed` } satisfies ApiResponse);
  } catch (error) {
    console.error("[leads/bulk] POST error:", error);
    return Response.json({ success: false, error: "Internal server error" } satisfies ApiResponse, { status: 500 });
  }
}
