import { Icon } from '../ui/Icon'

/** The right/wrong banner shown after an answer, with an optional detail line. */
export function Feedback({ correct, title, children }) {
  return (
    <div
      role="status"
      className={`animate-fade-up rounded-xl border px-4 py-3 ${
        correct ? 'border-ok/40 bg-ok-soft' : 'border-warn/40 bg-warn-soft'
      }`}
    >
      <p className={`flex items-center gap-2 font-semibold ${correct ? 'text-ok' : 'text-warn'}`}>
        <Icon name={correct ? 'check' : 'x'} />
        {title ?? (correct ? 'Richtig! Benar.' : 'Leider falsch. Belum tepat.')}
      </p>
      {children && <div className="mt-1 text-sm text-text">{children}</div>}
    </div>
  )
}
