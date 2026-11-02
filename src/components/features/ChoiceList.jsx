import { useEffect } from 'react'
import { Icon } from '../ui/Icon'

/**
 * Multiple-choice options. After an answer, the correct option turns green
 * and a wrong pick turns red. Number keys 1–9 pick an option — pass
 * `keyboard={false}` when several lists share a page, or they would all answer.
 */
export function ChoiceList({
  choices,
  answer,
  picked,
  onPick,
  lang,
  renderChoice,
  columns = 'sm:grid-cols-2',
  keyboard = true,
}) {
  const answered = picked !== null

  useEffect(() => {
    if (answered || !keyboard) return
    const onKey = (event) => {
      if (event.target instanceof HTMLInputElement || event.metaKey || event.ctrlKey) return
      const index = Number(event.key) - 1
      if (index >= 0 && index < choices.length) onPick(index)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [answered, keyboard, choices.length, onPick])

  return (
    <ul className={`grid gap-2 ${columns}`}>
      {choices.map((choice, index) => {
        const isAnswer = index === answer
        const isPicked = index === picked
        let tone = 'border-line bg-surface hover:border-accent-strong hover:bg-surface-2'
        if (answered && isAnswer) tone = 'border-ok bg-ok-soft'
        else if (answered && isPicked) tone = 'border-warn bg-warn-soft animate-shake'
        else if (answered) tone = 'border-line bg-surface opacity-60'

        return (
          <li key={`${index}-${choice}`}>
            <button
              type="button"
              disabled={answered}
              onClick={() => onPick(index)}
              className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition ${tone}`}
            >
              {keyboard && (
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-surface-2 text-xs font-bold text-muted">
                  {index + 1}
                </span>
              )}
              <span lang={lang} className="flex-1 font-medium">
                {renderChoice ? renderChoice(choice) : choice}
              </span>
              {answered && isAnswer && <Icon name="check" className="h-5 w-5 text-ok" />}
              {answered && isPicked && !isAnswer && <Icon name="x" className="h-5 w-5 text-warn" />}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
