import { SITE } from '../../lib/site'

export function Footer() {
  return (
    <footer className="pb-nav border-t border-line lg:pb-0">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="font-semibold text-text">{SITE.name}</span> · {SITE.byline} — dibuat oleh {SITE.author}
        </p>
        <p className="flex items-center gap-4">
          <a href={SITE.github} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-text">
            Kode sumber
          </a>
          <span lang="de">Viel Erfolg beim Deutschlernen! 🇩🇪</span>
        </p>
      </div>
    </footer>
  )
}
