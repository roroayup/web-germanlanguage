import { useState } from 'react'
import { ChoiceList } from './ChoiceList'
import { Feedback } from './Feedback'
import { SessionProgress } from './SessionProgress'
import { SessionSummary } from './SessionSummary'
import { SpeakButton } from './SpeakButton'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'
import { useProgress } from '../../hooks/useProgress'
import { useSession } from '../../hooks/useSession'
import { QUIZ_KINDS } from '../../lib/quiz'

const kindLabel = (kind) => QUIZ_KINDS.find((k) => k.id === kind)?.label
const describe = (question) => ({ de: question.prompt, meaning: question.choices[question.answer] })

/** German-language prompts get lang="de" so screen readers pronounce them right. */
const promptIsGerman = (kind) => kind !== 'reverse'
const choicesAreGerman = (kind) => kind !== 'meaning'

export function QuizRunner({ questions, speech, onExit, onRestart }) {
  const { recordReview, recordQuiz } = useProgress()
  const session = useSession(questions)
  const [picked, setPicked] = useState(null)

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

  const question = session.current

  const pick = (index) => {
    const correct = index === question.answer
    setPicked(index)
    recordReview(question.progressKey, correct)
    session.record(correct)
  }

  const advance = () => {
    if (session.index + 1 >= session.total) {
      // `results` already includes this question: record() ran on pick.
      recordQuiz(session.results.filter((r) => r.correct).length, session.total)
    }
    setPicked(null)
    session.next()
  }

  return (
    <div className="mx-auto max-w-xl">
      <SessionProgress index={session.index} total={session.total} onExit={onExit} />

      <Card className="p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <Badge tone="accent">{kindLabel(question.kind)}</Badge>
          {question.speak && <SpeakButton speech={speech} text={question.speak} size="sm" />}
        </div>
        <p className="mt-4 text-sm text-muted">{question.label}</p>
        <p lang={promptIsGerman(question.kind) ? 'de' : undefined} className="mt-1 font-display text-3xl font-bold">
          {question.prompt}
        </p>
        {question.hint && <p className="mt-1 text-muted">{question.hint}</p>}
      </Card>

      <div className="mt-6">
        <ChoiceList
          choices={question.choices}
          answer={question.answer}
          picked={picked}
          onPick={pick}
          lang={choicesAreGerman(question.kind) ? 'de' : undefined}
          columns={question.kind === 'artikel' ? 'grid-cols-3' : 'sm:grid-cols-2'}
        />
      </div>

      {picked !== null && (
        <div className="mt-6 space-y-4">
          <Feedback correct={picked === question.answer}>
            {question.explain && <p lang={question.kind === 'grammar' ? undefined : 'de'}>{question.explain}</p>}
          </Feedback>
          <Button size="lg" className="w-full" onClick={advance} autoFocus>
            {session.index + 1 >= session.total ? 'Lihat hasil' : 'Lanjut'}{' '}
            <kbd className="text-xs opacity-70">Enter</kbd>
          </Button>
        </div>
      )}
    </div>
  )
}
