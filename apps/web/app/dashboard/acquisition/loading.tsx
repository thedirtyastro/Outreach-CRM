import { Header } from "@/components/layout/header";

export default function AcquisitionLoading() {
  return (
    <>
      <Header title="Client Acquisition" description="Track your outreach goals" />
      <div className="flex-1 p-4 sm:p-6 space-y-4 max-w-[1400px] animate-pulse">
        {/* Progress cards skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-3 sm:p-4 h-20 sm:h-24">
              <div className="h-3 bg-muted/50 rounded w-16 sm:w-20 mb-3" />
              <div className="h-5 sm:h-6 bg-muted/50 rounded w-10 sm:w-12" />
            </div>
          ))}
        </div>

        {/* Progress bar skeleton */}
        <div className="bg-card border border-border rounded-xl p-4 h-16" />

        {/* Charts row skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="md:col-span-1 lg:col-span-2 bg-card border border-border rounded-xl p-5 h-48 sm:h-64" />
          <div className="bg-card border border-border rounded-xl p-5 h-48 sm:h-64" />
        </div>

        {/* Funnel + Forecast skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="md:col-span-1 lg:col-span-2 bg-card border border-border rounded-xl p-5 h-48 sm:h-64" />
          <div className="bg-card border border-border rounded-xl p-5 h-48 sm:h-64" />
        </div>

        {/* Heatmap skeleton */}
        <div className="bg-card border border-border rounded-xl p-5 h-32 sm:h-40" />

        {/* Bottom row skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-5 h-40 sm:h-48" />
          <div className="bg-card border border-border rounded-xl p-5 h-40 sm:h-48" />
        </div>
      </div>
    </>
  );
}
