import { AdminHeader } from "@/components/admin/admin-header";
import { AdminUserDetail } from "@/components/admin/admin-user-detail";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <AdminHeader title="User Details" description="View user profile and statistics" />
      <div className="flex-1 p-4 sm:p-6">
        <AdminUserDetail userId={id} />
      </div>
    </>
  );
}
