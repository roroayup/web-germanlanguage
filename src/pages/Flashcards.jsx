import { useMemo, useState } from 'react'
import { PageShell } from '../components/layout/PageShell'
import { FlashcardDeck } from '../components/features/flashcards/FlashcardDeck'
import { TopicSelect } from '../components/features/TopicSelect'
import { SpeakButton } from '../components/features/SpeakButton'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ArticleTag } from '../components/ui/ArticleTag'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Segmented } from '../components/ui/Segmented'
import { useProgress } from '../hooks/useProgress'
import { useSpeech } from '../hooks/useSpeech'
import { buildSession, summarize } from '../lib/srs'
import { KEY, pluralLabel } from '../lib/german'
import vocabulary from '../data/vocabulary.json'
import verbs from '../data/verbs.json'

const SIZES = [10, 20, 30].map((value) => ({ value, label: `${value} kartu` }))
const keyOf = (card) => KEY.card(card.item.id)

const vocabCards = vocabulary.map((item) => ({ kind: 'word', item }))
const verbCards = verbs.map((item) => ({ kind: 'verb', item }))

const topicCounts = vocabulary.reduce((counts, word) => {
  counts[word.topic] = (counts[word.topic] ?? 0) + 1
  return counts
}, {})

function WordList({ words, speech }) {
  return (
    <ul className="divide-y divide-line">
      {words.map((word) => (
        <li key={word.id} className="flex items-center gap-3 py-3">
          <div className="min-w-0 flex-1">
            <p lang="de" className="font-semibold">
              {word.article && <ArticleTag article={word.article} className="mr-2" />}
              {word.de}
              {word.plural && <span className="ml-2 text-sm font-normal text-muted">· {pluralLabel(word)}</span>}
            </p>
            <p className="text-sm text-muted">{word.meaning}</p>
          </div>
          <SpeakButton speech={speech} text={word.article ? `${word.article} ${word.de}` : word.de} size="sm" />
        </li>
      ))}
    </ul>
  )
}

export default function Flashcards() {
  const { items: progressItems } = useProgress()
  const speech = useSpeech()
  const [deck, setDeck] = useState('word')
  const [topic, setTopic] = useState(null)
  const [size, setSize] = useState(10)
  const [session, setSession] = useState(null)
  const [showList, setShowList] = useState(false)

  const pool = useMemo(() => {
    if (deck === 'verb') return verbCards
    return topic ? vocabCards.filter((card) => card.item.topic === topic) : vocabCards
  }, [deck, topic])

  const start = (cards) => setSession({ cards, id: Date.now() })
  const startNew = () => start(buildSession(pool, progressItems, size, keyOf))

  if (session) {
    return (
      <PageShell>
        <FlashcardDeck
          key={session.id}
          cards={session.cards}
          speech={speech}
          onExit={() => setSession(null)}
          onRestart={(retry) => (retry ? start(retry) : startNew())}
        />
      </PageShell>
    )
  }

  const decks = [
    { id: 'word', title: 'Kosakata', de: 'Wortschatz', icon: '📖', cards: vocabCards },
    { id: 'verb', title: 'Kata kerja', de: 'Verben', icon: '🔁', cards: verbCards },
  ]
  const poolSummary = summarize(pool, progressItems, keyOf)

  return (
    <PageShell
      de="Vokabeln"
      title="Flashcard kosakata"
      description="Kartu yang kamu jawab “belum hafal” akan muncul lagi lebih cepat; yang sudah hafal muncul makin jarang (sistem Leitner)."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <div role="radiogroup" aria-label="Pilih dek" className="grid gap-3 sm:grid-cols-2">
            {decks.map((option) => {
              const summary = summarize(option.cards, progressItems, keyOf)
              const selected = deck === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setDeck(option.id)}
                  className={`rounded-card border-2 bg-surface p-5 text-left shadow-soft transition ${
                    selected ? 'border-accent-strong' : 'border-line hover:border-muted'
                  }`}
                >
                  <span className="text-3xl" aria-hidden="true">
                    {option.icon}
                  </span>
                  <p lang="de" className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted">
                    {option.de}
                  </p>
                  <p className="text-lg font-bold">{option.title}</p>
                  <p className="mt-1 text-sm text-muted">
                    {summary.mastered} dikuasai · {summary.learning} dipelajari · {summary.total} total
                  </p>
                  <ProgressBar value={summary.mastered} max={summary.total} label={`Progres ${option.title}`} className="mt-3" />
                </button>
              )
            })}
          </div>

          <Card className="p-5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-semibold">
                Daftar {deck === 'verb' ? 'kata kerja' : 'kata'} ({pool.length})
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowList((value) => !value)} aria-expanded={showList}>
                {showList ? 'Sembunyikan' : 'Tampilkan'}
              </Button>
            </div>
            {showList && (
              <div className="mt-2 max-h-[32rem] overflow-y-auto pr-1">
                {deck === 'verb' ? (
                  <WordList
                    words={verbs.map((verb) => ({ id: verb.id, de: verb.inf, meaning: verb.meaning, pos: 'verb' }))}
                    speech={speech}
                  />
                ) : (
                  <WordList words={pool.map((card) => card.item)} speech={speech} />
                )}
              </div>
            )}
          </Card>
        </div>

        <Card className="order-first h-fit space-y-5 p-5 lg:sticky lg:top-24 lg:order-none">
          <h2 className="font-semibold">Atur sesi</h2>
          {deck === 'word' && <TopicSelect value={topic} onChange={setTopic} counts={topicCounts} />}
          <div>
            <p className="mb-1.5 text-sm font-semibold">Jumlah kartu</p>
            <Segmented label="Jumlah kartu" options={SIZES} value={size} onChange={setSize} />
          </div>
          <p className="text-sm text-muted">
            Dari {poolSummary.total} kartu: {poolSummary.untouched} belum pernah dilihat, {poolSummary.learning} sedang
            dipelajari.
          </p>
          <Button size="lg" className="w-full" onClick={startNew}>
            Mulai {Math.min(size, pool.length)} kartu
          </Button>
          {speech.ready && !speech.hasGermanVoice && (
            <p className="rounded-lg bg-warn-soft p-3 text-xs text-warn">
              Perangkat ini tidak punya suara bahasa Jerman, jadi tombol audio disembunyikan. Pasang suara “Deutsch” di
              pengaturan text-to-speech perangkatmu untuk mengaktifkannya.
            </p>
          )}
        </Card>
      </div>
    </PageShell>
  )
}
