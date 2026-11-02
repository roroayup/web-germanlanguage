export function RouteFallback() {
  return (
    <div className="grid min-h-[50vh] place-items-center" role="status">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" />
      <span className="sr-only">Memuat…</span>
    </div>
  )
}
