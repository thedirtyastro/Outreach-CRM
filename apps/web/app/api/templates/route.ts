import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@outreach/server/auth";
import { connectDB, Template } from "@outreach/database";
import { createTemplateSchema } from "@outreach/shared";
import type { ApiResponse, PaginatedResponse } from "@outreach/shared";
import type { ITemplate } from "@outreach/shared";

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session?.user) {
      return Response.json({ success: false, error: "Unauthorized" } satisfies ApiResponse, { status: 401 });
    }

    await connectDB();
    const userId = session.user.id;
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20", 10));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Template.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Template.countDocuments({ userId }),
    ]);

    const result: PaginatedResponse<ITemplate> = {
      data: data as unknown as ITemplate[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    return Response.json({ success: true, data: result } satisfies ApiResponse<PaginatedResponse<ITemplate>>);
  } catch (error) {
    console.error("[templates] GET error:", error);
    return Response.json({ success: false, error: "Internal server error" } satisfies ApiResponse, { status: 500 });
  }
}

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

    const parsed = createTemplateSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Validation error" } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const template = await Template.create({ ...parsed.data, userId });
    return Response.json(
      { success: true, data: template.toJSON() } satisfies ApiResponse<ITemplate>,
      { status: 201 }
    );
  } catch (error) {
    console.error("[templates] POST error:", error);
    return Response.json({ success: false, error: "Internal server error" } satisfies ApiResponse, { status: 500 });
  }
}
