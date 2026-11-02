export function EmptyState({ icon = '📭', title, children }) {
  return (
    <div className="rounded-card border border-dashed border-line px-6 py-12 text-center">
      <p className="text-4xl" aria-hidden="true">
        {icon}
      </p>
      <p className="mt-3 font-semibold">{title}</p>
      {children && <div className="mt-2 text-sm text-muted">{children}</div>}
    </div>
  )
}
