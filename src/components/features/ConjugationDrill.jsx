import { useState } from 'react'
import { AnswerInput } from './AnswerInput'
import { Feedback } from './Feedback'
import { SessionProgress } from './SessionProgress'
import { SessionSummary } from './SessionSummary'
import { SpeakButton } from './SpeakButton'
import { VerbTable } from './VerbTable'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'
import { useProgress } from '../../hooks/useProgress'
import { useSession } from '../../hooks/useSession'
import { checkAnswer } from '../../lib/normalize'
import { KEY, PRONOUNS, TENSES, VERB_TYPES, conjugate } from '../../lib/german'

const labelOf = (key) => PRONOUNS.find((pronoun) => pronoun.key === key).label
// "er / sie / es" is a label, not something to say aloud; speak the first pronoun.
const spokenPronoun = (key) => labelOf(key).split(' / ')[0]

const describe = ({ verb, pronoun, tense }) => ({
  de: `${labelOf(pronoun)} ${conjugate(verb, pronoun, tense)}`,
  meaning: `${verb.inf} · ${TENSES.find((t) => t.id === tense).label}`,
})

/** Items are { verb, pronoun, tense }. */
export function ConjugationDrill({ items, speech, onExit, onRestart }) {
  const { recordReview } = useProgress()
  const session = useSession(items)
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)

  if (session.done) {
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

  const { verb, pronoun, tense } = session.current
  const expected = conjugate(verb, pronoun, tense)
  const tenseLabel = TENSES.find((t) => t.id === tense).label

  const submit = () => {
    const outcome = checkAnswer(input, expected)
    setResult(outcome)
    recordReview(KEY.konj(verb.id), outcome.correct)
    session.record(outcome.correct)
    speech.play(`${spokenPronoun(pronoun)} ${expected}`)
  }

  const advance = () => {
    setInput('')
    setResult(null)
    session.next()
  }

  return (
    <div className="mx-auto max-w-xl">
      <SessionProgress index={session.index} total={session.total} onExit={onExit} />

      <Card className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="accent">{tenseLabel}</Badge>
          <Badge>{VERB_TYPES[verb.type]}</Badge>
          {verb.separable && <Badge>trennbar</Badge>}
        </div>
        <p lang="de" className="mt-4 font-display text-3xl font-bold">
          {verb.inf}
        </p>
        <p className="text-muted">{verb.meaning}</p>

        <p lang="de" className="mt-6 text-2xl">
          <span className="font-semibold">{labelOf(pronoun)}</span>{' '}
          {result ? (
            <span className={result.correct ? 'text-ok' : 'text-warn'}>{expected}</span>
          ) : (
            <span className="text-muted">___</span>
          )}
        </p>
        {tense === 'perfekt' && !result && (
          <p className="mt-1 text-sm text-muted">Tulis kata kerja bantu + Partizip II, misalnya: habe gemacht</p>
        )}
        {verb.separable && tense === 'praesens' && !result && (
          <p className="mt-1 text-sm text-muted">Awalan “{verb.prefix}” dipisah ke belakang, misalnya: stehe auf</p>
        )}

        <div className="mt-6">
          <AnswerInput
            key={session.index}
            value={input}
            onChange={setInput}
            onSubmit={submit}
            disabled={Boolean(result)}
            placeholder="Ketik bentuk kata kerjanya…"
            label={`Bentuk ${verb.inf} untuk ${labelOf(pronoun)}`}
          />
        </div>
      </Card>

      {result && (
        <div className="mt-6 space-y-4">
          <Feedback correct={result.correct}>
            {result.note && <p>{result.note}</p>}
            {!result.correct && input.trim() && (
              <p>
                Jawabanmu: <span lang="de" className="line-through">{input}</span> → yang benar:{' '}
                <strong lang="de">{expected}</strong>
              </p>
            )}
            <div className="mt-2 flex items-center gap-2">
              <span lang="de" className="text-muted">
                {verb.example}
              </span>
              <SpeakButton speech={speech} text={verb.example} size="sm" label="Dengarkan contoh" />
            </div>
          </Feedback>
          <Card className="p-4">
            <VerbTable verb={verb} highlight={pronoun} />
          </Card>
          <Button size="lg" className="w-full" onClick={advance} autoFocus>
            Lanjut <kbd className="text-xs opacity-70">Enter</kbd>
          </Button>
        </div>
      )}
    </div>
  )
}
