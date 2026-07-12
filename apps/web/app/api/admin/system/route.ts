import { NextResponse } from "next/server";
import { supabase } from "@outreach/database/client";

export async function GET() {
  try {
    // Check database health by running a simple query and measuring latency
    const dbStart = Date.now();
    const { error: dbError } = await supabase
      .from("user")
      .select("id", { count: "exact", head: true });
    const dbLatency = Date.now() - dbStart;

    // Calculate uptime (since process start)
    const uptimeSeconds = process.uptime();
    const uptimeHours = Math.floor(uptimeSeconds / 3600);
    const uptimeMinutes = Math.floor((uptimeSeconds % 3600) / 60);
    const uptime = uptimeHours > 0
      ? `${uptimeHours}h ${uptimeMinutes}m`
      : `${uptimeMinutes}m`;

    // Check if email service is configured
    const emailConfigured = !!(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);

    // Storage estimate (count attachments)
    const { data: attachments } = await supabase
      .from("attachments")
      .select("size");

    const totalStorageBytes = (attachments as { size: number }[] | null)?.reduce((sum, a) => sum + (a.size || 0), 0) ?? 0;
    const totalStorageMb = Math.round(totalStorageBytes / (1024 * 1024));

    return NextResponse.json({
      database: {
        status: dbError ? "down" : dbLatency > 2000 ? "degraded" : "healthy",
        latencyMs: dbLatency,
      },
      api: {
        status: "healthy",
        uptime,
      },
      email: {
        status: emailConfigured ? "healthy" : "degraded",
        queueSize: 0, // Resend handles queuing externally
      },
      storage: {
        status: "healthy",
        usedMb: totalStorageMb,
      },
    });
  } catch (error) {
    console.error("[admin/system] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch system status" },
      { status: 500 }
    );
  }
}
