import { headers } from "next/headers";
import { auth, getDashboardStats } from "@outreach/server";
import { Header } from "@/components/layout/header";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default async function DashboardPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  const userId = session?.user?.id ?? "";

  const stats = userId ? await getDashboardStats(userId) : null;

  return (
    <>
      <Header
        title="Dashboard"
        description={`Good ${getTimeOfDay()}, ${session?.user?.name?.split(" ")[0] ?? "there"}`}
      />
      <div className="flex-1 p-6">
        <DashboardContent stats={stats} />
      </div>
    </>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
