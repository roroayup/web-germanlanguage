import { useEffect, useState } from 'react'
import { AnswerInput } from './AnswerInput'
import { ChoiceList } from './ChoiceList'
import { Feedback } from './Feedback'
import { SessionProgress } from './SessionProgress'
import { SessionSummary } from './SessionSummary'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Icon } from '../ui/Icon'
import { useProgress } from '../../hooks/useProgress'
import { useSession } from '../../hooks/useSession'
import { checkAnswer } from '../../lib/normalize'
import { SPEED_OPTIONS } from '../../lib/speech'
import { KEY } from '../../lib/german'

const describe = ({ sentence }) => ({ de: sentence.de, meaning: sentence.meaning })

/**
 * Items are { sentence, choices, answer }. Modes:
 *  - 'choose': hear the sentence, pick its meaning
 *  - 'dictation': hear it, type it
 * When the device has no German voice, `transcript` shows the text instead of
 * audio, turning 'choose' into a reading exercise rather than a dead end.
 */
export function ListeningDrill({ items, mode, rate, transcript, speech, onExit, onRestart }) {
  const { recordReview } = useProgress()
  const session = useSession(items)
  const [picked, setPicked] = useState(null)
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)
  const sentence = session.current?.sentence

  // Play each new sentence automatically; the user's tap on "Mulai" counts as
  // the gesture browsers require before speech is allowed.
  useEffect(() => {
    if (sentence && !transcript) speech.play(sentence.de, rate)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- replay only when the sentence changes
  }, [sentence?.id])

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

  const { choices, answer } = session.current
  const answered = mode === 'choose' ? picked !== null : result !== null
  const correct = mode === 'choose' ? picked === answer : result?.correct

  const finish = (wasCorrect) => {
    recordReview(KEY.hoeren(sentence.id), wasCorrect)
    session.record(wasCorrect)
  }

  const pick = (index) => {
    setPicked(index)
    finish(index === answer)
  }

  const submit = () => {
    const outcome = checkAnswer(input, sentence.de)
    setResult(outcome)
    finish(outcome.correct)
  }

  const advance = () => {
    setPicked(null)
    setInput('')
    setResult(null)
    session.next()
  }

  return (
    <div className="mx-auto max-w-xl">
      <SessionProgress index={session.index} total={session.total} onExit={onExit} />

      <Card className="p-6 text-center sm:p-8">
        {transcript ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Baca kalimat ini</p>
            <p lang="de" className="mt-3 font-display text-2xl font-bold">
              {sentence.de}
            </p>
          </>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              {mode === 'choose' ? 'Dengarkan, lalu pilih artinya' : 'Dengarkan, lalu tuliskan'}
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => speech.play(sentence.de, rate)}
                aria-label="Putar kalimat"
                className={`grid h-20 w-20 place-items-center rounded-full bg-ink text-ink-fg shadow-lift transition hover:opacity-90 ${
                  speech.speaking ? 'animate-pulse-ring' : ''
                }`}
              >
                <Icon name="speaker" className="h-8 w-8" />
              </button>
              <Button variant="secondary" size="sm" onClick={() => speech.play(sentence.de, SPEED_OPTIONS[0].value)}>
                🐢 Lambat
              </Button>
            </div>
            {answered && (
              <p lang="de" className="mt-5 animate-fade-up font-display text-2xl font-bold">
                {sentence.de}
              </p>
            )}
          </>
        )}
      </Card>

      <div className="mt-6">
        {mode === 'choose' ? (
          <ChoiceList choices={choices} answer={answer} picked={picked} onPick={pick} columns="" />
        ) : (
          <AnswerInput
            key={session.index}
            value={input}
            onChange={setInput}
            onSubmit={submit}
            disabled={answered}
            placeholder="Tulis kalimat yang kamu dengar…"
            label="Kalimat yang didengar"
          />
        )}
      </div>

      {answered && (
        <div className="mt-6 space-y-4">
          <Feedback correct={correct}>
            {result?.note && <p>{result.note}</p>}
            {mode === 'dictation' && !correct && (
              <p>
                Jawabanmu: <span lang="de" className="line-through">{input}</span>
              </p>
            )}
            <p className="text-muted">{sentence.meaning}</p>
          </Feedback>
          <Button size="lg" className="w-full" onClick={advance} autoFocus>
            Lanjut <kbd className="text-xs opacity-70">Enter</kbd>
          </Button>
        </div>
      )}
    </div>
  )
}
