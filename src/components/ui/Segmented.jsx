/**
 * A row of mutually exclusive options (session size, tense, filter).
 * Uses radio semantics so arrow-key users get the expected behaviour.
 */
export function Segmented({ label, options, value, onChange, className = '' }) {
  return (
    <div role="radiogroup" aria-label={label} className={`inline-flex flex-wrap gap-1 rounded-xl bg-surface-2 p-1 ${className}`}>
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={String(option.value)}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
              selected ? 'bg-surface text-text shadow-soft' : 'text-muted hover:text-text'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
