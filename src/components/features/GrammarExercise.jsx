import { useMemo, useState } from 'react'
import { ChoiceList } from './ChoiceList'
import { useProgress } from '../../hooks/useProgress'
import { shuffle } from '../../lib/shuffle'
import { KEY } from '../../lib/german'

/** One inline multiple-choice exercise at the end of a grammar topic. */
export function GrammarExercise({ topicId, exercise, index }) {
  const { recordReview } = useProgress()
  const [picked, setPicked] = useState(null)

  // The data lists the right answer first; shuffle once per mount.
  const { choices, answer } = useMemo(() => {
    const correct = exercise.choices[exercise.answer]
    const shuffled = shuffle(exercise.choices)
    return { choices: shuffled, answer: shuffled.indexOf(correct) }
  }, [exercise])

  const pick = (choice) => {
    setPicked(choice)
    recordReview(KEY.grammatik(`${topicId}-${index}`), choice === answer)
  }

  return (
    <li className="rounded-xl border border-line p-4">
      <p lang="de" className="mb-3 font-semibold">
        <span className="mr-2 text-muted">{index + 1}.</span>
        {exercise.prompt}
      </p>
      <ChoiceList
        choices={choices}
        answer={answer}
        picked={picked}
        onPick={pick}
        lang="de"
        keyboard={false}
        columns="sm:grid-cols-3"
      />
      {picked !== null && (
        <p className={`mt-3 text-sm ${picked === answer ? 'text-ok' : 'text-warn'}`}>
          {picked === answer ? '✓ Benar. ' : '✗ Belum tepat. '}
          <span className="text-text">{exercise.explain}</span>
        </p>
      )}
    </li>
  )
}
