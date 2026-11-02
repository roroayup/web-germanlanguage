import { useRef } from 'react'
import { UMLAUTS } from '../../lib/normalize'

/**
 * A text field for typed German, with ä ö ü ß buttons above it. The buttons
 * insert at the caret and keep focus in the field, so typing flows on.
 */
export function AnswerInput({ value, onChange, onSubmit, disabled, placeholder, label, submitLabel = 'Periksa' }) {
  const inputRef = useRef(null)

  const insert = (char) => {
    const input = inputRef.current
    const start = input?.selectionStart ?? value.length
    const end = input?.selectionEnd ?? value.length
    const next = value.slice(0, start) + char + value.slice(end)
    onChange(next)

    // Restore the caret after React re-renders the controlled value.
    requestAnimationFrame(() => {
      input?.focus()
      input?.setSelectionRange(start + char.length, start + char.length)
    })
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (!disabled && value.trim()) onSubmit()
      }}
      className="space-y-3"
    >
      <div className="flex flex-wrap gap-1.5" aria-label="Sisipkan huruf khusus">
        {UMLAUTS.map((char) => (
          <button
            key={char}
            type="button"
            disabled={disabled}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => insert(char)}
            className="h-9 min-w-9 rounded-lg border border-line bg-surface px-2 font-semibold transition hover:bg-surface-2 disabled:opacity-40"
          >
            {char}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          lang="de"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          aria-label={label}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          autoFocus
          className="h-12 min-w-0 flex-1 rounded-xl border border-line bg-surface px-4 text-lg outline-none transition focus:border-accent-strong disabled:opacity-70"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="h-12 shrink-0 rounded-xl bg-ink px-5 text-sm font-semibold text-ink-fg transition hover:opacity-90 disabled:opacity-40"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
