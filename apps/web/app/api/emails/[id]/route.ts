import { NextRequest, NextResponse } from "next/server";
import { auth, getEmailById, deleteEmail } from "@outreach/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const email = await getEmailById(id, session.user.id);
    if (!email) return NextResponse.json({ error: "Email not found" }, { status: 404 });

    return NextResponse.json(email);
  } catch (error) {
    console.error("Error fetching email:", error);
    return NextResponse.json({ error: "Failed to fetch email" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const success = await deleteEmail(id, session.user.id);
    if (!success) return NextResponse.json({ error: "Email not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting email:", error);
    return NextResponse.json({ error: "Failed to delete email" }, { status: 500 });
  }
}
