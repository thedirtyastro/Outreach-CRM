import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { connectDB, Lead, Activity } from "@/database";
import { createLeadSchema } from "@/lib/validations";
import type { ApiResponse, PaginatedResponse } from "@/types";
import type { ILead } from "@/types";

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
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
    const skip = (page - 1) * limit;

    // Filters
    const search = searchParams.get("search");
    const status = searchParams.getAll("status");
    const platform = searchParams.getAll("platform");
    const priority = searchParams.getAll("priority");
    const response = searchParams.getAll("response");
    const tags = searchParams.getAll("tags");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const isArchived = searchParams.get("isArchived") === "true";
    const sortField = searchParams.get("sortField") ?? "createdAt";
    const sortDir = searchParams.get("sortDir") === "asc" ? 1 : -1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = { userId, isArchived };

    if (search) {
      query.$text = { $search: search };
    }
    if (status.length > 0) query.status = { $in: status };
    if (platform.length > 0) query.platform = { $in: platform };
    if (priority.length > 0) query.priority = { $in: priority };
    if (response.length > 0) query.response = { $in: response };
    if (tags.length > 0) query.tags = { $in: tags };
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const [data, total] = await Promise.all([
      Lead.find(query)
        .sort({ [sortField]: sortDir })
        .skip(skip)
        .limit(limit)
        .lean(),
      Lead.countDocuments(query),
    ]);

    const result: PaginatedResponse<ILead> = {
      data: data as unknown as ILead[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    return Response.json({ success: true, data: result } satisfies ApiResponse<PaginatedResponse<ILead>>);
  } catch (error) {
    console.error("[leads/route] GET error:", error);
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

    const parsed = createLeadSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { success: false, error: parsed.error.errors[0]?.message ?? "Validation error" } satisfies ApiResponse,
        { status: 400 }
      );
    }

    // Duplicate detection by email or linkedin
    const { email, linkedin } = parsed.data;
    if (email || linkedin) {
      const orConditions = [];
      if (email) orConditions.push({ email, userId });
      if (linkedin) orConditions.push({ linkedin, userId });
      const existing = orConditions.length > 0
        ? await Lead.findOne({ $or: orConditions }).lean()
        : null;

      if (existing) {
        return Response.json(
          {
            success: false,
            error: "duplicate",
            data: existing,
            message: "A lead with this email or LinkedIn already exists",
          },
          { status: 409 }
        );
      }
    }

    const lead = await Lead.create({ ...parsed.data, userId });

    // Log activity
    await Activity.create({
      userId,
      leadId: lead._id,
      type: "lead_created",
      description: `Lead ${lead.name} was created`,
      icon: "user-plus",
    });

    return Response.json(
      { success: true, data: lead.toJSON(), message: "Lead created" } satisfies ApiResponse<ILead>,
      { status: 201 }
    );
  } catch (error) {
    console.error("[leads/route] POST error:", error);
    return Response.json({ success: false, error: "Internal server error" } satisfies ApiResponse, { status: 500 });
  }
}
