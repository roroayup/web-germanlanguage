import { SITE } from '../../lib/site'

export function Footer() {
  return (
    <footer className="pb-nav border-t border-line lg:pb-0">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="font-semibold text-text">{SITE.name}</span> · {SITE.byline} — dibuat oleh {SITE.author}
        </p>
        <p lang="de">Viel Erfolg beim Deutschlernen! 🇩🇪</p>
      </div>
    </footer>
  )
}
