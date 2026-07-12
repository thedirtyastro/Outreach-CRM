import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@outreach/server";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const metadata = {
  title: "Admin Panel | OutReach CRM",
};

// For now, gate by a hardcoded admin email list.
// Replace with a proper role check once RBAC is implemented.
const ADMIN_EMAILS = [
  process.env.ADMIN_EMAIL ?? "admin@outreachcrm.com",
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session?.user) {
    redirect("/login");
  }

  // Basic admin check — expand to role-based once roles table exists
  const isAdmin = ADMIN_EMAILS.includes(session.user.email) || session.user.email?.endsWith("@outreachcrm.com");

  if (!isAdmin) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 ml-60 flex flex-col min-h-screen overflow-auto">
        {children}
      </main>
    </div>
  );
}
