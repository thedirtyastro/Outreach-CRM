import { NextRequest, NextResponse } from "next/server";
import { auth } from "@outreach/server/auth";
import { connectDB } from "@outreach/database/connection";
import { Settings } from "@outreach/database/schemas/settings.schema";
import { z } from "zod";
import crypto from "crypto";

const settingsSchema = z.object({
  theme: z.enum(["dark", "light", "system"]).optional(),
  notifications: z.object({
    email: z.boolean(),
    desktop: z.boolean(),
    followUpReminder: z.boolean(),
    meetingReminder: z.boolean(),
  }).optional(),
  emailSettings: z.object({
    signature: z.string().optional(),
    defaultFrom: z.string().optional(),
    trackOpens: z.boolean(),
    trackClicks: z.boolean(),
  }).optional(),
  timezone: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    let settings = await Settings.findOne({ userId: session.user.id }).lean();
    if (!settings) {
      settings = await Settings.create({
        userId: session.user.id,
        theme: "dark",
        notifications: {
          email: true,
          desktop: true,
          followUpReminder: true,
          meetingReminder: true,
        },
        emailSettings: {
          trackOpens: true,
          trackClicks: true,
        },
        timezone: "UTC",
      });
    }

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

    await connectDB();

    const settings = await Settings.findOneAndUpdate(
      { userId: session.user.id },
      { $set: validated },
      { new: true, upsert: true }
    );

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

    await connectDB();

    const newKey = `crm_${crypto.randomBytes(24).toString("hex")}`;

    const settings = await Settings.findOneAndUpdate(
      { userId: session.user.id },
      { $set: { apiKey: newKey } },
      { new: true, upsert: true }
    );

    return NextResponse.json({ apiKey: settings.apiKey });
  } catch (error) {
    console.error("Error generating API key:", error);
    return NextResponse.json({ error: "Failed to generate API key" }, { status: 500 });
  }
}
