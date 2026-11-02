import { useState } from 'react'
import { PageShell } from '../components/layout/PageShell'
import { QuizRunner } from '../components/features/QuizRunner'
import { TopicSelect } from '../components/features/TopicSelect'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Segmented } from '../components/ui/Segmented'
import { EmptyState } from '../components/ui/EmptyState'
import { useProgress } from '../hooks/useProgress'
import { useSpeech } from '../hooks/useSpeech'
import { QUIZ_KINDS, buildQuiz } from '../lib/quiz'
import vocabulary from '../data/vocabulary.json'
import verbs from '../data/verbs.json'
import grammar from '../data/grammar.json'

const CONTENT = { vocabulary, verbs, grammar }
const COUNTS = [10, 20].map((value) => ({ value, label: `${value} soal` }))

const formatDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

export default function Quiz() {
  const { progress } = useProgress()
  const speech = useSpeech()
  const [count, setCount] = useState(10)
  const [kinds, setKinds] = useState(QUIZ_KINDS.map((kind) => kind.id))
  const [topic, setTopic] = useState(null)
  const [session, setSession] = useState(null)

  const start = (questions) => setSession({ questions, id: Date.now() })
  const startNew = () => start(buildQuiz(CONTENT, { count, kinds, topic }))

  const toggleKind = (id) =>
    setKinds((current) => (current.includes(id) ? current.filter((k) => k !== id) : [...current, id]))

  if (session) {
    return (
      <PageShell>
        {session.questions.length ? (
          <QuizRunner
            key={session.id}
            questions={session.questions}
            speech={speech}
            onExit={() => setSession(null)}
            onRestart={(retry) => (retry ? start(retry) : startNew())}
          />
        ) : (
          <EmptyState icon="🤔" title="Tidak ada soal untuk pilihan ini">
            <Button variant="secondary" className="mt-4" onClick={() => setSession(null)}>
              Ubah pengaturan
            </Button>
          </EmptyState>
        )}
      </PageShell>
    )
  }

  return (
    <PageShell
      de="Quiz"
      title="Kuis campuran"
      description="Arti kata, terjemahan, artikel, konjugasi dan tata bahasa dalam satu kuis. Jawabanmu juga ikut memperbarui jadwal pengulangan."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Card className="h-fit p-6">
          <h2 className="font-semibold">Riwayat kuis</h2>
          {progress.quizHistory.length ? (
            <ul className="mt-4 divide-y divide-line">
              {progress.quizHistory.map((entry, index) => {
                const percent = Math.round((entry.score / entry.total) * 100)
                return (
                  <li key={index} className="flex items-center gap-4 py-3">
                    <span className="w-28 text-sm text-muted">{formatDate(entry.date)}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                      <div
                        className={`h-full rounded-full ${percent >= 80 ? 'bg-ok' : percent >= 50 ? 'bg-accent' : 'bg-warn'}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-16 text-right text-sm font-semibold tabular-nums">
                      {entry.score}/{entry.total}
                    </span>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted">Belum ada kuis. Hasil 20 kuis terakhir akan muncul di sini.</p>
          )}
        </Card>

        <Card className="order-first h-fit space-y-5 p-5 lg:sticky lg:top-24 lg:order-none">
          <h2 className="font-semibold">Atur kuis</h2>
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Jenis soal</legend>
            <div className="flex flex-wrap gap-2">
              {QUIZ_KINDS.map((kind) => {
                const checked = kinds.includes(kind.id)
                return (
                  <label
                    key={kind.id}
                    className={`cursor-pointer rounded-lg border px-3 py-1.5 text-sm transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent-strong ${
                      checked ? 'border-accent-strong bg-accent-soft font-semibold' : 'border-line text-muted'
                    }`}
                  >
                    <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleKind(kind.id)} />
                    {kind.label}
                  </label>
                )
              })}
            </div>
          </fieldset>
          <TopicSelect
            value={topic}
            onChange={setTopic}
            label="Topik kosakata"
            allLabel="Semua topik"
          />
          <div>
            <p className="mb-1.5 text-sm font-semibold">Jumlah soal</p>
            <Segmented label="Jumlah soal" options={COUNTS} value={count} onChange={setCount} />
          </div>
          <Button size="lg" className="w-full" onClick={startNew} disabled={!kinds.length}>
            Mulai kuis
          </Button>
          {!kinds.length && <p className="text-xs text-warn">Pilih minimal satu jenis soal.</p>}
        </Card>
      </div>
    </PageShell>
  )
}
