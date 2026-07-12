import { headers } from "next/headers";
import { auth } from "@outreach/server";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminOverview } from "@/components/admin/admin-overview";

export default async function AdminPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  return (
    <>
      <AdminHeader
        title="Admin Overview"
        description={`Welcome back, ${session?.user?.name?.split(" ")[0] ?? "Admin"}`}
      />
      <div className="flex-1 p-6">
        <AdminOverview />
      </div>
    </>
  );
}
