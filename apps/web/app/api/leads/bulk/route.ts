import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@outreach/server/auth";
import { connectDB, Lead } from "@outreach/database";
import type { ApiResponse } from "@outreach/shared";

const bulkSchema = z.object({
  ids: z.array(z.string()).min(1),
  action: z.enum(["delete", "archive", "restore"]),
});

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session?.user) {
      return Response.json({ success: false, error: "Unauthorized" } satisfies ApiResponse, { status: 401 });
    }

    await connectDB();
    const userId = session.user.id;
    const body = await request.json();

    const parsed = bulkSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { success: false, error: "Invalid request" } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const { ids, action } = parsed.data;
    const filter = { _id: { $in: ids }, userId };

    if (action === "delete") {
      await Lead.deleteMany(filter);
    } else if (action === "archive") {
      await Lead.updateMany(filter, { $set: { isArchived: true, archivedAt: new Date() } });
    } else if (action === "restore") {
      await Lead.updateMany(filter, { $set: { isArchived: false }, $unset: { archivedAt: "" } });
    }

    return Response.json({ success: true, message: `Bulk ${action} completed` } satisfies ApiResponse);
  } catch (error) {
    console.error("[leads/bulk] POST error:", error);
    return Response.json({ success: false, error: "Internal server error" } satisfies ApiResponse, { status: 500 });
  }
}
