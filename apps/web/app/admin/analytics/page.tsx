import { AdminHeader } from "@/components/admin/admin-header";
import { AdminAnalytics } from "@/components/admin/admin-analytics";

export default function AdminAnalyticsPage() {
  return (
    <>
      <AdminHeader title="Platform Analytics" description="Platform-wide performance metrics" />
      <div className="flex-1 p-4 sm:p-6">
        <AdminAnalytics />
      </div>
    </>
  );
}
