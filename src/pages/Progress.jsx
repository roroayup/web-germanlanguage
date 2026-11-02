import { useRef, useState } from 'react'
import { PageShell } from '../components/layout/PageShell'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Icon } from '../components/ui/Icon'
import { ProgressBar } from '../components/ui/ProgressBar'
import { StatTile } from '../components/ui/StatTile'
import { EmptyState } from '../components/ui/EmptyState'
import { useProgress } from '../hooks/useProgress'
import { countMastered, mostMissed, summarize } from '../lib/srs'
import { exportFileName } from '../lib/storage'
import { KEY, isArticleDrillable, withArticle } from '../lib/german'
import vocabulary from '../data/vocabulary.json'
import verbs from '../data/verbs.json'
import sentences from '../data/sentences.json'
import grammar from '../data/grammar.json'
import topics from '../data/topics.json'

const nouns = vocabulary.filter(isArticleDrillable)
const exercises = grammar.flatMap((topic) => (topic.exercises ?? []).map((exercise, i) => ({ topic, exercise, i })))

const MODES = [
  { label: 'Kosakata', de: 'Wortschatz', items: vocabulary, keyOf: (w) => KEY.card(w.id) },
  { label: 'Kata kerja (flashcard)', de: 'Verben', items: verbs, keyOf: (v) => KEY.card(v.id) },
  { label: 'Artikel', de: 'der/die/das', items: nouns, keyOf: (w) => KEY.artikel(w.id) },
  { label: 'Bentuk jamak (kuis)', de: 'Plural', items: nouns.filter((w) => w.plural), keyOf: (w) => KEY.plural(w.id) },
  { label: 'Konjugasi', de: 'Konjugation', items: verbs, keyOf: (v) => KEY.konj(v.id) },
  { label: 'Mendengar', de: 'Hören', items: sentences, keyOf: (s) => KEY.hoeren(s.id) },
  { label: 'Latihan grammar', de: 'Grammatik', items: exercises, keyOf: (e) => KEY.grammatik(`${e.topic.id}-${e.i}`) },
]

/** Maps every progress key back to something readable for the "sering salah" list. */
function buildLabels() {
  const labels = {}
  for (const word of vocabulary) {
    labels[KEY.card(word.id)] = { de: withArticle(word), meaning: word.meaning, mode: 'Kosakata' }
    labels[KEY.artikel(word.id)] = { de: withArticle(word), meaning: word.meaning, mode: 'Artikel' }
    if (word.plural) labels[KEY.plural(word.id)] = { de: withArticle(word), meaning: `die ${word.plural}`, mode: 'Plural' }
  }
  for (const verb of verbs) {
    labels[KEY.card(verb.id)] = { de: verb.inf, meaning: verb.meaning, mode: 'Kata kerja' }
    labels[KEY.konj(verb.id)] = { de: verb.inf, meaning: verb.meaning, mode: 'Konjugasi' }
  }
  for (const sentence of sentences) {
    labels[KEY.hoeren(sentence.id)] = { de: sentence.de, meaning: sentence.meaning, mode: 'Hören' }
  }
  for (const { topic, exercise, i } of exercises) {
    labels[KEY.grammatik(`${topic.id}-${i}`)] = {
      de: exercise.prompt,
      meaning: exercise.choices[exercise.answer],
      mode: topic.title,
    }
  }
  return labels
}

// Content is static, so the lookup is built once per page load.
const labels = buildLabels()

function DataTools() {
  const { progress, importProgress, reset } = useProgress()
  const fileRef = useRef(null)
  const [message, setMessage] = useState(null)
  const [confirming, setConfirming] = useState(false)

  const exportData = () => {
    const blob = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = exportFileName()
    link.click()
    URL.revokeObjectURL(url)
    setMessage({ ok: true, text: 'File cadangan sudah diunduh.' })
  }

  const importData = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const ok = importProgress(JSON.parse(await file.text()))
      setMessage(
        ok
          ? { ok: true, text: 'Progres berhasil dipulihkan.' }
          : { ok: false, text: 'File ini bukan cadangan progres dari aplikasi ini.' },
      )
    } catch {
      setMessage({ ok: false, text: 'File tidak bisa dibaca. Pastikan formatnya JSON.' })
    }
  }

  return (
    <Card className="p-6">
      <h2 className="font-semibold">Data progres</h2>
      <p className="mt-1 text-sm text-muted">
        Progres hanya tersimpan di browser ini. Unduh cadangan untuk memindahkannya ke perangkat lain.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="secondary" onClick={exportData}>
          <Icon name="download" className="h-4 w-4" /> Export
        </Button>
        <Button variant="secondary" onClick={() => fileRef.current?.click()}>
          <Icon name="upload" className="h-4 w-4" /> Import
        </Button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={importData} />
        {confirming ? (
          <>
            <Button
              className="bg-warn! text-white!"
              onClick={() => {
                reset()
                setConfirming(false)
                setMessage({ ok: true, text: 'Progres sudah direset.' })
              }}
            >
              Ya, hapus semua
            </Button>
            <Button variant="ghost" onClick={() => setConfirming(false)}>
              Batal
            </Button>
          </>
        ) : (
          <Button variant="ghost" className="text-warn!" onClick={() => setConfirming(true)}>
            Reset progres
          </Button>
        )}
      </div>
      {message && (
        <p role="status" className={`mt-3 text-sm ${message.ok ? 'text-ok' : 'text-warn'}`}>
          {message.text}
        </p>
      )}
    </Card>
  )
}

export default function Progress() {
  const { progress, items } = useProgress()
  const missed = mostMissed(items, 10).filter((entry) => labels[entry.key])

  const topicRows = topics.map((topic) => {
    const words = vocabulary.filter((word) => word.topic === topic.id)
    return { topic, ...summarize(words, items, (w) => KEY.card(w.id)) }
  })

  return (
    <PageShell
      de="Fortschritt"
      title="Progres belajar"
      description="Kata dianggap “dikuasai” setelah naik ke kotak 4 dari 5 dalam sistem Leitner, yaitu setelah beberapa kali benar berturut-turut."
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Streak" value={`${progress.streak.current} 🔥`} hint="hari berturut-turut" />
        <StatTile label="Rekor streak" value={progress.streak.longest} hint="hari" />
        <StatTile label="Kosakata dikuasai" value={countMastered(items, 'card:v-')} hint={`dari ${vocabulary.length} kata`} />
        <StatTile label="Total latihan" value={Object.values(items).reduce((sum, s) => sum + s.seen, 0)} hint="jawaban" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-semibold">Per mode latihan</h2>
          <ul className="mt-4 space-y-4">
            {MODES.map((mode) => {
              const summary = summarize(mode.items, items, mode.keyOf)
              return (
                <li key={mode.label}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-medium">
                      {mode.label} <span lang="de" className="text-muted">· {mode.de}</span>
                    </span>
                    <span className="tabular-nums text-muted">
                      {summary.mastered}/{summary.total}
                    </span>
                  </div>
                  <ProgressBar value={summary.mastered} max={summary.total} label={mode.label} className="mt-1.5" />
                </li>
              )
            })}
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold">Sering salah</h2>
          {missed.length ? (
            <ul className="mt-3 divide-y divide-line">
              {missed.map(({ key, misses }) => (
                <li key={key} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p lang="de" className="truncate font-semibold">
                      {labels[key].de}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {labels[key].mode} · {labels[key].meaning}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-warn-soft px-2 py-0.5 text-xs font-semibold text-warn">
                    {misses}× salah
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-3">
              <EmptyState icon="🎯" title="Belum ada">
                Kata yang sering kamu jawab salah akan muncul di sini.
              </EmptyState>
            </div>
          )}
        </Card>
      </div>

      <Card className="mt-6 p-6">
        <h2 className="font-semibold">Kosakata per topik</h2>
        <ul className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {topicRows.map(({ topic, mastered, learning, total }) => (
            <li key={topic.id}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span>
                  <span aria-hidden="true">{topic.icon}</span>{' '}
                  <span lang="de" className="font-medium">
                    {topic.de}
                  </span>
                </span>
                <span className="tabular-nums text-muted">
                  {mastered}/{total}
                  {learning > 0 && <span className="text-xs"> (+{learning})</span>}
                </span>
              </div>
              <ProgressBar value={mastered} max={total} label={topic.de} className="mt-1.5" />
            </li>
          ))}
        </ul>
      </Card>

      <div className="mt-6">
        <DataTools />
      </div>
    </PageShell>
  )
}
