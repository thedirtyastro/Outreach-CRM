export default function AcquisitionLoading() {
  return (
    <div className="space-y-6 max-w-[1400px] animate-pulse">
      {/* Progress cards skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4 h-24">
            <div className="h-3 bg-muted/50 rounded w-20 mb-3" />
            <div className="h-6 bg-muted/50 rounded w-12" />
          </div>
        ))}
      </div>

      {/* Charts row skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 h-64" />
        <div className="bg-card border border-border rounded-xl p-5 h-64" />
      </div>

      {/* Bottom row skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 h-48" />
        <div className="bg-card border border-border rounded-xl p-5 h-48" />
      </div>
    </div>
  );
}
