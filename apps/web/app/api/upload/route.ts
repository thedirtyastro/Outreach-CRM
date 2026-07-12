import { NextRequest, NextResponse } from "next/server";
import { auth, createAttachment } from "@outreach/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const leadId = formData.get("leadId") as string | null;
    const emailId = formData.get("emailId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const { attachment, error } = await createAttachment({
      userId: session.user.id,
      leadId: leadId || undefined,
      emailId: emailId || undefined,
      name: file.name,
      size: file.size,
      mimeType: file.type,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json(attachment, { status: 201 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
