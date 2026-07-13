import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSystem } from "@/components/admin/admin-system";

export default function AdminSystemPage() {
  return (
    <>
      <AdminHeader title="System Monitoring" description="Platform health and status" />
      <div className="flex-1 p-4 sm:p-6">
        <AdminSystem />
      </div>
    </>
  );
}
