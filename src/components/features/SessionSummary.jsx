import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Icon } from '../ui/Icon'

function verdict(percent) {
  if (percent === 100) return { de: 'Ausgezeichnet!', id: 'Sempurna!' }
  if (percent >= 80) return { de: 'Sehr gut!', id: 'Bagus sekali!' }
  if (percent >= 50) return { de: 'Gut gemacht!', id: 'Lumayan, terus berlatih!' }
  return { de: 'Weiter so!', id: 'Jangan menyerah, ulangi lagi.' }
}

/**
 * End-of-session card. `describe(item)` returns { de, meaning } for the
 * missed list, so every study mode can reuse this.
 */
export function SessionSummary({ results, describe, onRetryMissed, onRestart, onExit }) {
  const correct = results.filter((result) => result.correct).length
  const total = results.length
  const percent = total ? Math.round((correct / total) * 100) : 0
  const missed = results.filter((result) => !result.correct)
  const { de, id } = verdict(percent)

  return (
    <Card className="mx-auto max-w-xl animate-fade-up p-6 text-center sm:p-8">
      <p lang="de" className="font-display text-3xl font-bold">
        {de}
      </p>
      <p className="mt-1 text-muted">{id}</p>

      <p className="mt-6 text-6xl font-bold tabular-nums">
        {correct}
        <span className="text-2xl text-muted">/{total}</span>
      </p>
      <p className="mt-1 text-sm text-muted">{percent}% benar</p>

      {missed.length > 0 && (
        <div className="mt-6 text-left">
          <p className="mb-2 text-sm font-semibold">Perlu diulang:</p>
          <ul className="divide-y divide-line rounded-xl border border-line">
            {missed.map(({ item }, index) => {
              const { de: german, meaning } = describe(item)
              return (
                <li key={index} className="flex items-baseline justify-between gap-4 px-4 py-2.5 text-sm">
                  <span lang="de" className="font-semibold">
                    {german}
                  </span>
                  <span className="text-right text-muted">{meaning}</span>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {missed.length > 0 && onRetryMissed && (
          <Button variant="accent" onClick={() => onRetryMissed(missed.map((result) => result.item))}>
            <Icon name="refresh" className="h-4 w-4" />
            Ulangi yang salah
          </Button>
        )}
        <Button variant={missed.length ? 'secondary' : 'accent'} onClick={onRestart}>
          Sesi baru
        </Button>
        <Button variant="ghost" onClick={onExit}>
          Selesai
        </Button>
      </div>
    </Card>
  )
}
