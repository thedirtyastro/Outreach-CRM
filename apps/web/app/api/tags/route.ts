import { NextRequest, NextResponse } from "next/server";
import { auth } from "@outreach/server/auth";
import { supabase } from "@outreach/database/client";
import { z } from "zod";

const tagSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().default("#6366f1"),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .eq("user_id", session.user.id)
      .order("name", { ascending: true });

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const validated = tagSchema.parse(body);

    // Check for duplicate
    const { data: existing } = await supabase
      .from("tags")
      .select("id")
      .eq("user_id", session.user.id)
      .eq("name", validated.name)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Tag already exists" }, { status: 409 });
    }

    const { data: tag, error } = await supabase
      .from("tags")
      .insert({ user_id: session.user.id, name: validated.name, color: validated.color })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error("Error creating tag:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create tag" }, { status: 500 });
  }
}
