import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { ArticleDrill } from '../components/features/ArticleDrill'
import { TopicSelect } from '../components/features/TopicSelect'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ArticleTag } from '../components/ui/ArticleTag'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Segmented } from '../components/ui/Segmented'
import { useProgress } from '../hooks/useProgress'
import { useSpeech } from '../hooks/useSpeech'
import { buildSession, summarize } from '../lib/srs'
import { KEY, isArticleDrillable } from '../lib/german'
import vocabulary from '../data/vocabulary.json'

const nouns = vocabulary.filter(isArticleDrillable)
const keyOf = (word) => KEY.artikel(word.id)
const SIZES = [10, 20, 30].map((value) => ({ value, label: `${value} kata` }))

const topicCounts = nouns.reduce((counts, word) => {
  counts[word.topic] = (counts[word.topic] ?? 0) + 1
  return counts
}, {})

const RULES = [
  { article: 'die', text: '-ung, -heit, -keit, -schaft, -tät, -ion', example: 'die Wohnung, die Universität' },
  { article: 'die', text: 'banyak kata berakhiran -e', example: 'die Lampe, die Straße' },
  { article: 'das', text: '-chen, -lein (selalu)', example: 'das Brötchen' },
  { article: 'der', text: 'hari, bulan, musim', example: 'der Montag, der Sommer' },
]

export default function Articles() {
  const { items: progressItems } = useProgress()
  const speech = useSpeech()
  const [topic, setTopic] = useState(null)
  const [size, setSize] = useState(10)
  const [session, setSession] = useState(null)

  const pool = useMemo(() => (topic ? nouns.filter((word) => word.topic === topic) : nouns), [topic])
  const start = (words) => setSession({ words, id: Date.now() })
  const startNew = () => start(buildSession(pool, progressItems, size, keyOf))

  if (session) {
    return (
      <PageShell>
        <ArticleDrill
          key={session.id}
          words={session.words}
          speech={speech}
          onExit={() => setSession(null)}
          onRestart={(retry) => (retry ? start(retry) : startNew())}
        />
      </PageShell>
    )
  }

  const summary = summarize(nouns, progressItems, keyOf)
  const byArticle = ['der', 'die', 'das'].map((article) => ({
    article,
    count: nouns.filter((word) => word.article === article).length,
  }))

  return (
    <PageShell
      de="Artikel-Trainer"
      title="Latihan der / die / das"
      description="Tebak artikel setiap kata benda. Setelah menjawab, kamu akan melihat bentuk jamak dan petunjuk pola akhirannya."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-semibold">Progres artikel</h2>
              <p className="text-sm text-muted">
                {summary.mastered} dari {summary.total} kata benda dikuasai
              </p>
            </div>
            <ProgressBar value={summary.mastered} max={summary.total} label="Progres artikel" className="mt-3" />
            <div className="mt-5 grid grid-cols-3 gap-3">
              {byArticle.map(({ article, count }) => (
                <div key={article} className="rounded-xl bg-surface-2 p-3 text-center">
                  <ArticleTag article={article} />
                  <p className="mt-1 text-2xl font-bold tabular-nums">{count}</p>
                  <p className="text-xs text-muted">kata</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold">Pola yang membantu</h2>
            <p className="mt-1 text-sm text-muted">
              Sebagian besar gender harus dihafal, tetapi beberapa akhiran memberi petunjuk kuat.
            </p>
            <ul className="mt-4 space-y-3">
              {RULES.map((rule) => (
                <li key={rule.text} className="flex items-start gap-3">
                  <ArticleTag article={rule.article} className="mt-0.5 w-11 justify-center" />
                  <div className="text-sm">
                    <p className="font-medium">{rule.text}</p>
                    <p lang="de" className="text-muted">
                      {rule.example}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <Link to="/grammatik/g-artikel" className="mt-4 inline-block text-sm font-semibold underline underline-offset-4">
              Baca materi artikel & plural →
            </Link>
          </Card>
        </div>

        <Card className="order-first h-fit space-y-5 p-5 lg:sticky lg:top-24 lg:order-none">
          <h2 className="font-semibold">Atur sesi</h2>
          <TopicSelect value={topic} onChange={setTopic} counts={topicCounts} />
          <div>
            <p className="mb-1.5 text-sm font-semibold">Jumlah kata</p>
            <Segmented label="Jumlah kata" options={SIZES} value={size} onChange={setSize} />
          </div>
          <Button size="lg" className="w-full" onClick={startNew}>
            Mulai {Math.min(size, pool.length)} kata
          </Button>
          <p className="text-xs text-muted">Pintasan: tombol 1 / 2 / 3 untuk der / die / das, Enter untuk lanjut.</p>
        </Card>
      </div>
    </PageShell>
  )
}
