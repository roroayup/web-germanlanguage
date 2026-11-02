import { useEffect, useState } from 'react'
import { FlashCard } from './FlashCard'
import { SessionProgress } from '../SessionProgress'
import { SessionSummary } from '../SessionSummary'
import { Button } from '../../ui/Button'
import { useProgress } from '../../../hooks/useProgress'
import { useSession } from '../../../hooks/useSession'
import { KEY, withArticle } from '../../../lib/german'

const describe = (card) =>
  card.kind === 'verb'
    ? { de: card.item.inf, meaning: card.item.meaning }
    : { de: withArticle(card.item), meaning: card.item.meaning }

export function FlashcardDeck({ cards, speech, onExit, onRestart }) {
  const { recordReview } = useProgress()
  const session = useSession(cards)
  const [flipped, setFlipped] = useState(false)
  const { current, done, record, next } = session

  const grade = (known) => {
    recordReview(KEY.card(current.item.id), known)
    record(known)
    setFlipped(false)
    next()
  }

  // Space flips, 1 = belum hafal, 2 = sudah hafal (once the back is showing).
  useEffect(() => {
    if (done) return
    const onKey = (event) => {
      if (event.metaKey || event.ctrlKey) return
      // Focused controls handle their own Space/Enter; reacting here too would double-fire.
      if (event.target.closest?.('button, input, select, textarea, a')) return
      if (event.key === ' ') {
        event.preventDefault()
        setFlipped((value) => !value)
      } else if (flipped && (event.key === '1' || event.key === '2')) {
        grade(event.key === '2')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (done) {
    return (
      <SessionSummary
        results={session.results}
        describe={describe}
        onRetryMissed={onRestart}
        onRestart={() => onRestart(null)}
        onExit={onExit}
      />
    )
  }

  return (
    <div className="mx-auto max-w-xl">
      <SessionProgress index={session.index} total={session.total} onExit={onExit} />
      <FlashCard key={current.item.id} card={current} flipped={flipped} onFlip={() => setFlipped((v) => !v)} speech={speech} />

      <div className="mt-6 grid grid-cols-2 gap-3">
        {flipped ? (
          <>
            <Button variant="secondary" size="lg" onClick={() => grade(false)}>
              Belum hafal <kbd className="text-xs text-muted">1</kbd>
            </Button>
            <Button size="lg" onClick={() => grade(true)}>
              Sudah hafal <kbd className="text-xs opacity-70">2</kbd>
            </Button>
          </>
        ) : (
          <Button variant="accent" size="lg" className="col-span-2" onClick={() => setFlipped(true)}>
            Lihat arti
          </Button>
        )}
      </div>
    </div>
  )
}
