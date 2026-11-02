/**
 * Common page frame: width, gutters, and an optional heading block. `de` is
 * the German page name shown as an eyebrow above the Indonesian title.
 */
export function PageShell({ de, title, description, actions, children, width = 'max-w-5xl' }) {
  return (
    <main className={`mx-auto ${width} px-4 py-8 sm:py-10`}>
      {(title || de) && (
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {de && (
              <p lang="de" className="text-sm font-semibold uppercase tracking-wider text-accent-strong">
                {de}
              </p>
            )}
            {title && <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">{title}</h1>}
            {description && <p className="mt-2 max-w-2xl text-muted">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      {children}
    </main>
  )
}
