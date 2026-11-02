import { Link, useParams } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { GrammarExercise } from '../components/features/GrammarExercise'
import { SpeakButton } from '../components/features/SpeakButton'
import { Card } from '../components/ui/Card'
import { Icon } from '../components/ui/Icon'
import { ProgressBar } from '../components/ui/ProgressBar'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import { useProgress } from '../hooks/useProgress'
import { useSpeech } from '../hooks/useSpeech'
import { KEY } from '../lib/german'
import grammar from '../data/grammar.json'

function topicScore(topic, progressItems) {
  const total = topic.exercises?.length ?? 0
  const done = (topic.exercises ?? []).filter((_, i) => progressItems[KEY.grammatik(`${topic.id}-${i}`)]).length
  return { total, done }
}

function Table({ table }) {
  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <table lang="de" className="w-full min-w-[22rem] border-collapse text-sm">
        <thead>
          <tr>
            {table.head.map((cell, i) => (
              <th key={i} scope="col" className="border-b-2 border-line px-3 py-2 text-left font-semibold">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, r) => (
            <tr key={r} className="even:bg-surface-2/60">
              {row.map((cell, c) =>
                c === 0 ? (
                  <th key={c} scope="row" className="border-b border-line px-3 py-2 text-left font-medium text-muted">
                    {cell}
                  </th>
                ) : (
                  <td key={c} className="border-b border-line px-3 py-2">
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TopicDetail({ topic, index, speech }) {
  const previous = grammar[index - 1]
  const next = grammar[index + 1]

  return (
    <PageShell width="max-w-3xl">
      <Link to="/grammatik" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-text">
        <Icon name="back" className="h-4 w-4" /> Semua topik
      </Link>

      <header className="mt-4">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent-strong">
          Topik {index + 1} dari {grammar.length}
        </p>
        <h1 lang="de" className="mt-1 font-display text-3xl font-bold sm:text-4xl">
          {topic.title}
        </h1>
        <p className="mt-1 text-lg text-muted">{topic.subtitle}</p>
        <p className="mt-5 text-lg leading-relaxed">{topic.summary}</p>
      </header>

      <div className="mt-8 space-y-6">
        {topic.sections.map((section) => (
          <Card as="section" key={section.heading} className="space-y-4 p-5 sm:p-6">
            <h2 className="text-xl font-bold">{section.heading}</h2>
            {section.text?.map((paragraph, i) => (
              <p key={i} className="leading-relaxed">
                {paragraph}
              </p>
            ))}
            {section.table && <Table table={section.table} />}
            {section.examples?.length > 0 && (
              <ul className="space-y-2">
                {section.examples.map((example) => (
                  <li key={example.de} className="flex items-start gap-3 rounded-xl bg-surface-2 p-3">
                    <div className="flex-1">
                      <p lang="de" className="font-medium">
                        {example.de}
                      </p>
                      <p className="text-sm text-muted">{example.meaning}</p>
                    </div>
                    <SpeakButton speech={speech} text={example.de} size="sm" />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        ))}

        {topic.tip && (
          <aside className="rounded-card border border-accent/50 bg-accent-soft p-5">
            <p className="font-semibold">💡 Tipp</p>
            <p className="mt-1">{topic.tip}</p>
          </aside>
        )}

        {topic.exercises?.length > 0 && (
          <section>
            <h2 className="text-xl font-bold">
              Übung <span className="font-normal text-muted">· Latihan singkat</span>
            </h2>
            <ol className="mt-4 space-y-3">
              {topic.exercises.map((exercise, i) => (
                <GrammarExercise key={`${topic.id}-${i}`} topicId={topic.id} exercise={exercise} index={i} />
              ))}
            </ol>
          </section>
        )}
      </div>

      <nav aria-label="Topik lain" className="mt-10 grid gap-3 sm:grid-cols-2">
        {previous ? (
          <Link to={`/grammatik/${previous.id}`} className="rounded-xl border border-line p-4 hover:bg-surface-2">
            <span className="text-xs text-muted">← Sebelumnya</span>
            <span lang="de" className="block font-semibold">
              {previous.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link to={`/grammatik/${next.id}`} className="rounded-xl border border-line p-4 text-right hover:bg-surface-2">
            <span className="text-xs text-muted">Berikutnya →</span>
            <span lang="de" className="block font-semibold">
              {next.title}
            </span>
          </Link>
        )}
      </nav>
    </PageShell>
  )
}

export default function Grammar() {
  const { topicId } = useParams()
  const { items: progressItems } = useProgress()
  const speech = useSpeech()

  if (topicId) {
    const index = grammar.findIndex((topic) => topic.id === topicId)
    if (index === -1) {
      return (
        <PageShell>
          <EmptyState icon="🔎" title="Topik tidak ditemukan">
            <Button to="/grammatik" variant="secondary" className="mt-4">
              Lihat semua topik
            </Button>
          </EmptyState>
        </PageShell>
      )
    }
    // Keyed so exercise answers reset when moving to the next topic.
    return <TopicDetail key={topicId} topic={grammar[index]} index={index} speech={speech} />
  }

  return (
    <PageShell
      de="Grammatik"
      title="Ringkasan tata bahasa A1"
      description="Penjelasan singkat dalam bahasa Indonesia dengan tabel, contoh yang bisa didengar, dan latihan di setiap topik. Urutannya mengikuti urutan belajar yang umum."
    >
      <ol className="grid gap-4 sm:grid-cols-2">
        {grammar.map((topic, index) => {
          const score = topicScore(topic, progressItems)
          return (
            <li key={topic.id}>
              <Link
                to={`/grammatik/${topic.id}`}
                className="group flex h-full flex-col rounded-card border border-line bg-surface p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
              >
                <div className="flex items-start gap-4">
                  <span className="font-display text-3xl font-bold text-accent">{String(index + 1).padStart(2, '0')}</span>
                  <div className="min-w-0 flex-1">
                    <h2 lang="de" className="font-bold">
                      {topic.title}
                    </h2>
                    <p className="text-sm text-muted">{topic.subtitle}</p>
                  </div>
                  <Icon name="arrow" className="mt-1 h-4 w-4 text-muted transition group-hover:translate-x-1" />
                </div>
                <div className="mt-auto pt-4">
                  <ProgressBar value={score.done} max={score.total} label={`Latihan ${topic.title}`} />
                  <p className="mt-1.5 text-xs text-muted">
                    {score.done}/{score.total} latihan dicoba
                  </p>
                </div>
              </Link>
            </li>
          )
        })}
      </ol>
    </PageShell>
  )
}
