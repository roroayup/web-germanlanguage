import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Icon } from '../components/ui/Icon'
import { ArticleTag } from '../components/ui/ArticleTag'
import { useProgress } from '../hooks/useProgress'
import { useReveal } from '../hooks/useReveal'
import { countMastered } from '../lib/srs'
import { SITE } from '../lib/site'
import topics from '../data/topics.json'

/*
 * The landing page ships in the entry bundle, so it imports only topics.json
 * (tiny) and the progress store — never the vocabulary or verb files.
 */

const FEATURES = [
  {
    to: '/vokabeln',
    icon: 'cards',
    de: 'Vokabeln',
    title: 'Flashcard kosakata',
    text: 'Kosakata A1 dari 15 topik, lengkap dengan artikel, bentuk jamak, contoh kalimat dan audio.',
  },
  {
    to: '/artikel',
    icon: 'tag',
    de: 'Artikel-Trainer',
    title: 'Latihan der / die / das',
    text: 'Tebak gender kata benda dan dapatkan petunjuk pola akhiran, termasuk pengecualiannya.',
  },
  {
    to: '/konjugation',
    icon: 'verb',
    de: 'Konjugation',
    title: 'Latihan konjugasi',
    text: 'Ketik bentuk kata kerja dalam Präsens dan Perfekt, termasuk kata kerja tidak beraturan dan trennbar.',
  },
  {
    to: '/grammatik',
    icon: 'book',
    de: 'Grammatik',
    title: 'Ringkasan tata bahasa',
    text: '14 topik inti A1 dalam bahasa Indonesia: kasus, urutan kata, negasi, modal, Perfekt, dan lainnya.',
  },
  {
    to: '/hoeren',
    icon: 'ear',
    de: 'Hören',
    title: 'Latihan mendengar',
    text: 'Dengarkan kalimat sehari-hari, lalu pilih artinya atau tuliskan apa yang kamu dengar.',
  },
  {
    to: '/quiz',
    icon: 'quiz',
    de: 'Quiz',
    title: 'Kuis campuran',
    text: 'Gabungan semua materi dalam satu kuis singkat, dengan ringkasan hasil di akhir.',
  },
]

const STEPS = [
  { de: 'Lernen', title: 'Pelajari', text: 'Baca ringkasan grammar dan kenali kosakata baru lewat flashcard.' },
  { de: 'Üben', title: 'Latih', text: 'Uji artikel, konjugasi dan pendengaran sampai jawabanmu otomatis.' },
  { de: 'Wiederholen', title: 'Ulangi', text: 'Spaced repetition memunculkan lagi kata yang sering salah, tepat waktu.' },
]

function HeroCard() {
  return (
    <div className="relative mx-auto w-full max-w-sm" aria-hidden="true">
      <div className="absolute -inset-2 -z-10 rotate-3 sm:-inset-4 rounded-[2rem] bg-accent-soft" />
      <Card className="p-6 shadow-lift">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">Essen & Trinken</span>
          <span className="grid h-9 w-9 place-items-center rounded-full border border-line">
            <Icon name="speaker" className="h-4 w-4" />
          </span>
        </div>
        <p lang="de" className="mt-8 text-center font-display text-4xl font-bold">
          <span className="text-das">das</span> Brötchen
        </p>
        <p className="mt-2 text-center text-muted">roti kecil · die Brötchen</p>
        <p lang="de" className="mt-8 rounded-xl bg-surface-2 px-4 py-3 text-sm">
          Zum Frühstück esse ich zwei Brötchen.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-2 text-sm font-semibold">
          <span className="rounded-xl border border-line py-2.5 text-center">Belum hafal</span>
          <span className="rounded-xl bg-ink py-2.5 text-center text-ink-fg">Sudah hafal</span>
        </div>
      </Card>
    </div>
  )
}

export default function Home() {
  const { progress, items } = useProgress()
  const containerRef = useReveal()
  const mastered = countMastered(items, 'card:')
  const reviewed = Object.keys(items).length
  const started = reviewed > 0

  return (
    <main ref={containerRef}>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:pt-16 lg:grid-cols-[1.15fr_1fr] lg:pb-24 lg:pt-20">
          <div className="animate-fade-up">
            <p lang="de" className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-sm font-semibold">
              <span aria-hidden="true">🇩🇪</span> Deutsch lernen — Schritt für Schritt
            </p>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] sm:text-5xl lg:text-6xl">
              Belajar bahasa Jerman <span className="whitespace-nowrap">level A1</span>, sedikit demi sedikit setiap
              hari.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted">
              Kosakata, der/die/das, konjugasi, tata bahasa dan latihan mendengar dalam satu tempat. Gratis, tanpa akun,
              dan progresmu tersimpan di perangkat ini.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button to="/vokabeln" size="lg">
                {started ? 'Lanjut belajar' : 'Mulai belajar'}
                <Icon name="arrow" className="h-4 w-4" />
              </Button>
              <Button to="/grammatik" size="lg" variant="secondary">
                Lihat tata bahasa
              </Button>
            </div>

            <dl className="mt-10 grid max-w-md grid-cols-3 gap-3">
              <div className="rounded-xl border border-line bg-surface p-3">
                <dt className="text-xs text-muted">Streak</dt>
                <dd className="mt-0.5 flex items-center gap-1 text-2xl font-bold tabular-nums">
                  <Icon name="flame" className="h-5 w-5 text-flag-red" />
                  {progress.streak.current}
                </dd>
              </div>
              <div className="rounded-xl border border-line bg-surface p-3">
                <dt className="text-xs text-muted">Kata dikuasai</dt>
                <dd className="mt-0.5 text-2xl font-bold tabular-nums">{mastered}</dd>
              </div>
              <div className="rounded-xl border border-line bg-surface p-3">
                <dt className="text-xs text-muted">Latihan</dt>
                <dd className="mt-0.5 text-2xl font-bold tabular-nums">{reviewed}</dd>
              </div>
            </dl>
          </div>

          <HeroCard />
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="border-y border-line bg-surface-2/50">
        <div className="mx-auto max-w-6xl px-4 py-16 lg:py-20">
          <div className="reveal max-w-2xl">
            <p lang="de" className="text-sm font-semibold uppercase tracking-wider text-accent-strong">
              Was du hier lernst
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Semua yang dibutuhkan untuk A1</h2>
            <p className="mt-3 text-muted">Enam mode latihan yang saling melengkapi, dari kata pertama sampai kalimat lengkap.</p>
          </div>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <li key={feature.to} className="reveal">
                <Link
                  to={feature.to}
                  className="group flex h-full flex-col rounded-card border border-line bg-surface p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent-strong">
                    <Icon name={feature.icon} />
                  </span>
                  <p lang="de" className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted">
                    {feature.de}
                  </p>
                  <h3 className="mt-1 text-lg font-bold">{feature.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted">{feature.text}</p>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold">
                    Buka
                    <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Gender colours ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16 lg:py-20">
        <div className="reveal grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p lang="de" className="text-sm font-semibold uppercase tracking-wider text-accent-strong">
              Der, die, das
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Setiap gender punya warna</h2>
            <p className="mt-3 text-muted">
              Gender kata benda adalah tantangan terbesar di A1. Di seluruh aplikasi warnanya selalu sama, jadi kamu
              mengingat warna sekaligus artikelnya.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { article: 'der', word: 'Tisch', meaning: 'meja', label: 'maskulin', tone: 'border-der' },
              { article: 'die', word: 'Lampe', meaning: 'lampu', label: 'feminin', tone: 'border-die' },
              { article: 'das', word: 'Bett', meaning: 'tempat tidur', label: 'netral', tone: 'border-das' },
            ].map((sample) => (
              <Card key={sample.article} className={`border-t-4 p-5 ${sample.tone}`}>
                <ArticleTag article={sample.article} />
                <p lang="de" className="mt-3 text-2xl font-bold">
                  {sample.word}
                </p>
                <p className="text-sm text-muted">{sample.meaning}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted">{sample.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Topics ───────────────────────────────────────────────────────── */}
      <section className="border-y border-line bg-surface-2/50">
        <div className="mx-auto max-w-6xl px-4 py-16 lg:py-20">
          <div className="reveal max-w-2xl">
            <p lang="de" className="text-sm font-semibold uppercase tracking-wider text-accent-strong">
              Themen
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">{topics.length} topik A1</h2>
            <p className="mt-3 text-muted">Topik yang biasa muncul di kursus dan ujian A1 (misalnya Goethe-Zertifikat A1).</p>
          </div>
          <ul className="reveal mt-8 flex flex-wrap gap-2">
            {topics.map((topic) => (
              <li
                key={topic.id}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm"
              >
                <span aria-hidden="true">{topic.icon}</span>
                <span lang="de" className="font-semibold">
                  {topic.de}
                </span>
                <span className="text-muted">· {topic.meaning}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16 lg:py-20">
        <div className="reveal max-w-2xl">
          <p lang="de" className="text-sm font-semibold uppercase tracking-wider text-accent-strong">
            So funktioniert’s
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Tiga langkah, setiap hari</h2>
        </div>
        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.de} className="reveal rounded-card border border-line bg-surface p-6">
              <span className="font-display text-5xl font-bold text-accent">{index + 1}</span>
              <p lang="de" className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted">
                {step.de}
              </p>
              <h3 className="mt-1 text-lg font-bold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="reveal relative overflow-hidden rounded-[1.5rem] bg-ink px-6 py-12 text-center text-ink-fg sm:px-12">
          <div aria-hidden="true" className="flag-rule absolute inset-x-0 top-0 h-1.5" />
          <p lang="de" className="font-display text-3xl font-bold sm:text-4xl">
            Los geht’s!
          </p>
          <p className="mx-auto mt-3 max-w-lg opacity-80">
            Sepuluh kartu hari ini lebih baik daripada seratus kartu minggu depan. {SITE.tagline}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button to="/vokabeln" variant="accent" size="lg">
              Mulai dengan 10 kartu
            </Button>
            {/* A plain link: Button's variants would fight these inverted colours. */}
            <Link
              to="/quiz"
              className="inline-flex h-12 items-center rounded-xl border border-ink-fg/30 px-6 font-semibold transition hover:bg-ink-fg/10"
            >
              Coba kuis
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
