export default function SkeletonLoader() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="bg-indigo-200 rounded-2xl h-20" />
      <div className="bg-slate-200 rounded-2xl h-16" />
      {[1, 2, 3].map(i => (
        <div key={i} className="card space-y-3">
          <div className="flex justify-between">
            <div className="h-4 bg-slate-200 rounded w-1/3" />
            <div className="h-4 bg-slate-200 rounded w-16" />
          </div>
          <div className="h-3 bg-slate-100 rounded w-full" />
          <div className="h-3 bg-slate-100 rounded w-5/6" />
          <div className="h-3 bg-slate-100 rounded w-4/6" />
        </div>
      ))}
    </div>
  )
}
