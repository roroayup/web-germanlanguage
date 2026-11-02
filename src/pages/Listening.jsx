import { useMemo, useState } from 'react'
import { PageShell } from '../components/layout/PageShell'
import { ListeningDrill } from '../components/features/ListeningDrill'
import { TopicSelect } from '../components/features/TopicSelect'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Segmented } from '../components/ui/Segmented'
import { useProgress } from '../hooks/useProgress'
import { useSpeech } from '../hooks/useSpeech'
import { buildSession, summarize } from '../lib/srs'
import { buildChoices } from '../lib/shuffle'
import { SPEED_OPTIONS } from '../lib/speech'
import { KEY } from '../lib/german'
import sentences from '../data/sentences.json'

const keyOf = (sentence) => KEY.hoeren(sentence.id)
const MODES = [
  { value: 'choose', label: 'Pilih arti' },
  { value: 'dictation', label: 'Dikte (tulis)' },
]
const SIZES = [5, 10, 15].map((value) => ({ value, label: `${value} kalimat` }))
const allMeanings = sentences.map((sentence) => sentence.meaning)

const topicCounts = sentences.reduce((counts, sentence) => {
  counts[sentence.topic] = (counts[sentence.topic] ?? 0) + 1
  return counts
}, {})

export default function Listening() {
  const { items: progressItems } = useProgress()
  const speech = useSpeech()
  const [mode, setMode] = useState('choose')
  const [rate, setRate] = useState(SPEED_OPTIONS[1].value)
  const [topic, setTopic] = useState(null)
  const [size, setSize] = useState(10)
  const [session, setSession] = useState(null)

  const noVoice = speech.ready && !speech.hasGermanVoice
  // Without a voice there is nothing to dictate; fall back to reading.
  const activeMode = noVoice ? 'choose' : mode

  const pool = useMemo(() => (topic ? sentences.filter((s) => s.topic === topic) : sentences), [topic])

  const toItems = (list) =>
    list.map((sentence) => ({ sentence, ...buildChoices(sentence.meaning, allMeanings, 4) }))
  const start = (list) => setSession({ items: toItems(list), id: Date.now() })
  const startNew = () => start(buildSession(pool, progressItems, size, keyOf))

  if (session) {
    return (
      <PageShell>
        <ListeningDrill
          key={session.id}
          items={session.items}
          mode={activeMode}
          rate={rate}
          transcript={noVoice}
          speech={speech}
          onExit={() => setSession(null)}
          onRestart={(retry) => (retry ? start(retry.map((item) => item.sentence)) : startNew())}
        />
      </PageShell>
    )
  }

  const summary = summarize(sentences, progressItems, keyOf)

  return (
    <PageShell
      de="Hören"
      title="Latihan mendengar"
      description="Kalimat sehari-hari level A1 dibacakan oleh suara bahasa Jerman di perangkatmu. Mulai dengan “Pilih arti”, lalu tantang dirimu dengan dikte."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          {noVoice && (
            <Card className="border-warn/50 bg-warn-soft p-5">
              <p className="font-semibold text-warn">Suara bahasa Jerman tidak ditemukan</p>
              <p className="mt-1 text-sm">
                Perangkat ini tidak punya suara text-to-speech bahasa Jerman, jadi latihan ini ditampilkan sebagai
                latihan membaca. Untuk mengaktifkan audio, pasang suara “Deutsch” di pengaturan perangkat (Android:
                Pengaturan › Text-to-speech; iOS/macOS: Aksesibilitas › Konten Lisan; Windows: Ucapan), lalu muat ulang
                halaman ini.
              </p>
            </Card>
          )}

          <Card className="p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-semibold">Progres mendengar</h2>
              <p className="text-sm text-muted">
                {summary.mastered} dari {summary.total} kalimat dikuasai
              </p>
            </div>
            <ProgressBar value={summary.mastered} max={summary.total} label="Progres mendengar" className="mt-3" />
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold">Tips</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted">
              <li>Dengarkan dulu tanpa membaca. Gunakan tombol 🐢 kalau terlalu cepat.</li>
              <li>Saat dikte, tanda baca dan huruf kapital tidak dihitung salah, tetapi akan diberi catatan.</li>
              <li>Tidak bisa mengetik ä ö ü ß? Tulis ae, oe, ue, ss, atau pakai tombol di atas kolom jawaban.</li>
              <li>Ucapkan ulang kalimatnya dengan keras. Shadowing sangat membantu pelafalan.</li>
            </ul>
          </Card>
        </div>

        <Card className="order-first h-fit space-y-5 p-5 lg:sticky lg:top-24 lg:order-none">
          <h2 className="font-semibold">Atur latihan</h2>
          <div>
            <p className="mb-1.5 text-sm font-semibold">Mode</p>
            <Segmented
              label="Mode"
              options={noVoice ? MODES.slice(0, 1) : MODES}
              value={activeMode}
              onChange={setMode}
            />
          </div>
          {!noVoice && (
            <div>
              <p className="mb-1.5 text-sm font-semibold">Kecepatan</p>
              <Segmented label="Kecepatan" options={SPEED_OPTIONS} value={rate} onChange={setRate} />
            </div>
          )}
          <TopicSelect value={topic} onChange={setTopic} counts={topicCounts} />
          <div>
            <p className="mb-1.5 text-sm font-semibold">Jumlah kalimat</p>
            <Segmented label="Jumlah kalimat" options={SIZES} value={size} onChange={setSize} />
          </div>
          <Button size="lg" className="w-full" onClick={startNew}>
            Mulai {Math.min(size, pool.length)} kalimat
          </Button>
        </Card>
      </div>
    </PageShell>
  )
}
