import { AdminHeader } from "@/components/admin/admin-header";
import { AdminUsersTable } from "@/components/admin/admin-users-table";

export default function AdminUsersPage() {
  return (
    <>
      <AdminHeader title="User Management" description="Manage all registered users" />
      <div className="flex-1 p-4 sm:p-6">
        <AdminUsersTable />
      </div>
    </>
  );
}
