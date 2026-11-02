export function ProgressBar({ value, max, label, className = '' }) {
  const percent = max ? Math.round((value / max) * 100) : 0

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label}
      className={`h-2 overflow-hidden rounded-full bg-surface-2 ${className}`}
    >
      <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${percent}%` }} />
    </div>
  )
}
