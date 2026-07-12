import { NextRequest, NextResponse } from "next/server";
import { auth } from "@outreach/server/auth";
import {
  getSettings,
  updateSettings,
  regenerateApiKey,
} from "@outreach/server/services/settings.service";
import { z } from "zod";

const settingsSchema = z.object({
  theme: z.enum(["dark", "light", "system"]).optional(),
  notifications: z
    .object({
      email: z.boolean(),
      desktop: z.boolean(),
      followUpReminder: z.boolean(),
      meetingReminder: z.boolean(),
    })
    .optional(),
  emailSettings: z
    .object({
      signature: z.string().optional(),
      defaultFrom: z.string().optional(),
      trackOpens: z.boolean(),
      trackClicks: z.boolean(),
    })
    .optional(),
  timezone: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const settings = await getSettings(session.user.id);
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const validated = settingsSchema.parse(body);
    const settings = await updateSettings(session.user.id, validated);

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}

/** POST /api/settings — generate or regenerate API key */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    if (body.action !== "regenerate_api_key") {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    const apiKey = await regenerateApiKey(session.user.id);
    return NextResponse.json({ apiKey });
  } catch (error) {
    console.error("Error generating API key:", error);
    return NextResponse.json({ error: "Failed to generate API key" }, { status: 500 });
  }
}
