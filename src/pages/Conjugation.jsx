import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { ConjugationDrill } from '../components/features/ConjugationDrill'
import { VerbTable } from '../components/features/VerbTable'
import { SpeakButton } from '../components/features/SpeakButton'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { Segmented } from '../components/ui/Segmented'
import { useProgress } from '../hooks/useProgress'
import { useSpeech } from '../hooks/useSpeech'
import { buildSession, summarize } from '../lib/srs'
import { sample } from '../lib/shuffle'
import { fold } from '../lib/normalize'
import { KEY, PRONOUNS, TENSES, VERB_TYPES } from '../lib/german'
import verbs from '../data/verbs.json'

const FILTERS = [
  { value: 'all', label: 'Semua', test: () => true },
  { value: 'regular', label: 'Beraturan', test: (v) => v.type === 'regular' },
  { value: 'irregular', label: 'Tidak beraturan', test: (v) => v.type === 'irregular' || v.type === 'mixed' },
  { value: 'modal', label: 'Modal', test: (v) => v.type === 'modal' },
  { value: 'separable', label: 'Trennbar', test: (v) => v.separable },
]
const SIZES = [10, 20].map((value) => ({ value, label: `${value} soal` }))
const keyOf = (verb) => KEY.konj(verb.id)

export default function Conjugation() {
  const { items: progressItems } = useProgress()
  const speech = useSpeech()
  const [tense, setTense] = useState('praesens')
  const [filter, setFilter] = useState('all')
  const [size, setSize] = useState(10)
  const [session, setSession] = useState(null)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(verbs[0].id)

  const pool = useMemo(() => {
    const test = FILTERS.find((f) => f.value === filter).test
    // möchten has no Perfekt of its own, so it sits out Perfekt drills.
    return verbs.filter((verb) => test(verb) && (tense === 'praesens' || verb.partizip))
  }, [filter, tense])

  const start = (items) => setSession({ items, id: Date.now() })
  const startNew = () => {
    // Weakest verbs first; with a small pool a verb repeats with a new pronoun.
    const ordered = buildSession(pool, progressItems, pool.length, keyOf)
    const picks = Array.from({ length: size }, (_, i) => ordered[i % ordered.length])
    start(picks.map((verb) => ({ verb, tense, pronoun: sample(PRONOUNS, 1)[0].key })))
  }

  const matches = useMemo(() => {
    const query = fold(search)
    return query ? verbs.filter((verb) => fold(`${verb.inf} ${verb.meaning}`).includes(query)) : verbs
  }, [search])
  const selected = verbs.find((verb) => verb.id === selectedId)

  if (session) {
    return (
      <PageShell>
        <ConjugationDrill
          key={session.id}
          items={session.items}
          speech={speech}
          onExit={() => setSession(null)}
          onRestart={(retry) => (retry ? start(retry) : startNew())}
        />
      </PageShell>
    )
  }

  const summary = summarize(verbs, progressItems, keyOf)

  return (
    <PageShell
      de="Konjugation"
      title="Latihan konjugasi"
      description="Ketik bentuk kata kerja yang tepat untuk setiap kata ganti. Tidak punya keyboard Jerman? Tulis ae / oe / ue / ss, atau pakai tombol ä ö ü ß."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-semibold">Tabel konjugasi</h2>
            <p className="text-sm text-muted">
              {summary.mastered} dari {summary.total} kata kerja dikuasai
            </p>
          </div>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari kata kerja… (mis. fahren, makan)"
            aria-label="Cari kata kerja"
            className="mt-4 h-11 w-full rounded-xl border border-line bg-surface px-4 text-sm outline-none focus:border-accent-strong"
          />
          <div className="mt-3 flex max-h-32 flex-wrap gap-1.5 overflow-y-auto">
            {matches.map((verb) => (
              <button
                key={verb.id}
                type="button"
                lang="de"
                onClick={() => setSelectedId(verb.id)}
                aria-pressed={verb.id === selectedId}
                className={`rounded-lg border px-2.5 py-1 text-sm transition ${
                  verb.id === selectedId ? 'border-accent-strong bg-accent-soft font-semibold' : 'border-line hover:bg-surface-2'
                }`}
              >
                {verb.inf}
              </button>
            ))}
            {!matches.length && <p className="text-sm text-muted">Tidak ada kata kerja yang cocok.</p>}
          </div>

          {selected && (
            <div className="mt-6 border-t border-line pt-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p lang="de" className="font-display text-2xl font-bold">
                    {selected.inf}
                  </p>
                  <p className="text-muted">{selected.meaning}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge>{VERB_TYPES[selected.type]}</Badge>
                    {selected.separable && <Badge>trennbar</Badge>}
                    <Badge tone="accent">Perfekt + {selected.aux}</Badge>
                  </div>
                </div>
                <SpeakButton speech={speech} text={selected.inf} />
              </div>
              <div className="mt-4">
                <VerbTable verb={selected} />
              </div>
              <p className="mt-4 rounded-xl bg-surface-2 p-3 text-sm">
                <span lang="de" className="font-medium">
                  {selected.example}
                </span>
                <span className="block text-muted">{selected.exampleMeaning}</span>
              </p>
            </div>
          )}
        </Card>

        <Card className="order-first h-fit space-y-5 p-5 lg:sticky lg:top-24 lg:order-none">
          <h2 className="font-semibold">Atur latihan</h2>
          <div>
            <p className="mb-1.5 text-sm font-semibold">Waktu</p>
            <Segmented
              label="Tense"
              options={TENSES.map((t) => ({ value: t.id, label: `${t.label} (${t.note})` }))}
              value={tense}
              onChange={setTense}
            />
          </div>
          <div>
            <p className="mb-1.5 text-sm font-semibold">Jenis kata kerja</p>
            <Segmented label="Jenis kata kerja" options={FILTERS} value={filter} onChange={setFilter} />
          </div>
          <div>
            <p className="mb-1.5 text-sm font-semibold">Jumlah soal</p>
            <Segmented label="Jumlah soal" options={SIZES} value={size} onChange={setSize} />
          </div>
          <Button size="lg" className="w-full" onClick={startNew} disabled={!pool.length}>
            Mulai latihan ({pool.length} kata kerja)
          </Button>
          <p className="text-xs text-muted">
            Lupa aturannya? Baca{' '}
            <Link to="/grammatik/g-praesens" className="underline underline-offset-2">
              Präsens
            </Link>
            ,{' '}
            <Link to="/grammatik/g-vokalwechsel" className="underline underline-offset-2">
              Vokalwechsel
            </Link>{' '}
            atau{' '}
            <Link to="/grammatik/g-perfekt" className="underline underline-offset-2">
              Perfekt
            </Link>
            .
          </p>
        </Card>
      </div>
    </PageShell>
  )
}
