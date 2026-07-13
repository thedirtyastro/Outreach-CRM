export default function AcquisitionLoading() {
  return (
    <div className="space-y-4 sm:space-y-6 max-w-[1400px] mx-auto px-2 sm:px-0 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="h-7 bg-muted/50 rounded w-44" />
        <div className="flex gap-2">
          <div className="h-8 bg-muted/50 rounded w-20" />
          <div className="h-8 bg-muted/50 rounded w-20" />
        </div>
      </div>

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
  );
}
