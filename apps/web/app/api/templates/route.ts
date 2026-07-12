import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@outreach/server/auth";
import { supabase } from "@outreach/database/client";
import { createTemplateSchema } from "@outreach/shared";
import type { ApiResponse, PaginatedResponse } from "@outreach/shared";
import type { ITemplate } from "@outreach/shared";

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToTemplate(r: any): ITemplate {
  return {
    id: r.id, userId: r.user_id, name: r.name,
    subject: r.subject, body: r.body, type: r.type,
    variables: r.variables ?? [], isDefault: r.is_default ?? false,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session?.user) {
      return Response.json({ success: false, error: "Unauthorized" } satisfies ApiResponse, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20", 10));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count, error } = await supabase
      .from("templates")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    const result: PaginatedResponse<ITemplate> = {
      data: (data ?? []).map(rowToTemplate),
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.ceil((count ?? 0) / limit),
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

    const userId = session.user.id;
    const body = await request.json();

    const parsed = createTemplateSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Validation error" } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const { data: template, error } = await supabase
      .from("templates")
      .insert({
        user_id: userId,
        name: parsed.data.name,
        subject: parsed.data.subject,
        body: parsed.data.body,
        type: parsed.data.type ?? "custom",
        variables: parsed.data.variables ?? [],
        is_default: parsed.data.isDefault ?? false,
      })
      .select()
      .single();

    if (error) throw error;

    return Response.json(
      { success: true, data: rowToTemplate(template) } satisfies ApiResponse<ITemplate>,
      { status: 201 }
    );
  } catch (error) {
    console.error("[templates] POST error:", error);
    return Response.json({ success: false, error: "Internal server error" } satisfies ApiResponse, { status: 500 });
  }
}
