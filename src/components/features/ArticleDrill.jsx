import { useEffect, useState } from 'react'
import { Feedback } from './Feedback'
import { SessionProgress } from './SessionProgress'
import { SessionSummary } from './SessionSummary'
import { SpeakButton } from './SpeakButton'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { useProgress } from '../../hooks/useProgress'
import { useSession } from '../../hooks/useSession'
import { GENDERS, KEY, articleHint, pluralLabel, withArticle } from '../../lib/german'

const ARTICLES = ['der', 'die', 'das']

const describe = (word) => ({ de: withArticle(word), meaning: word.meaning })

export function ArticleDrill({ words, speech, onExit, onRestart }) {
  const { recordReview } = useProgress()
  const session = useSession(words)
  const [picked, setPicked] = useState(null)
  const { current: word, done } = session

  const pick = (article) => {
    if (picked) return
    const correct = article === word.article
    setPicked(article)
    recordReview(KEY.artikel(word.id), correct)
    session.record(correct)
    speech.play(withArticle(word))
  }

  const advance = () => {
    setPicked(null)
    session.next()
  }

  // 1/2/3 pick der/die/das. Enter needs no handler: "Lanjut" takes focus
  // when it appears, and a second listener would advance twice.
  useEffect(() => {
    if (done || picked) return
    const onKey = (event) => {
      if (event.metaKey || event.ctrlKey) return
      const index = Number(event.key) - 1
      if (index >= 0 && index < 3) pick(ARTICLES[index])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (done) {
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

  const correct = picked === word.article
  const hint = picked ? articleHint(word) : null
  const gender = GENDERS[word.article]

  return (
    <div className="mx-auto max-w-xl">
      <SessionProgress index={session.index} total={session.total} onExit={onExit} />

      <Card className={`p-8 text-center transition ${picked ? `border-t-4 ${gender.border}` : ''}`}>
        <p className="text-sm text-muted">{word.meaning}</p>
        <p lang="de" className="mt-4 font-display text-5xl font-bold">
          {picked ? (
            <>
              <span className={gender.text}>{word.article}</span> {word.de}
            </>
          ) : (
            <>
              <span className="text-muted">___</span> {word.de}
            </>
          )}
        </p>
        {picked && (
          <div className="mt-4 flex items-center justify-center gap-3 text-sm text-muted">
            <span>{pluralLabel(word)}</span>
            <SpeakButton speech={speech} text={withArticle(word)} size="sm" />
          </div>
        )}
      </Card>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {ARTICLES.map((article, index) => {
          const g = GENDERS[article]
          const isAnswer = article === word.article
          const isPicked = article === picked
          let style = `${g.soft} ${g.text} border-transparent ${g.hover}`
          if (picked && isAnswer) style = `${g.bg} text-ink-fg border-transparent`
          else if (picked && isPicked) style = `${g.soft} ${g.text} border-warn animate-shake`
          else if (picked) style = `${g.soft} ${g.text} border-transparent opacity-40`

          return (
            <button
              key={article}
              type="button"
              lang="de"
              disabled={Boolean(picked)}
              onClick={() => pick(article)}
              className={`flex h-20 flex-col items-center justify-center rounded-card border-2 text-2xl font-bold transition ${style}`}
            >
              {article}
              <span className="text-[11px] font-semibold opacity-70">
                {g.label} · {index + 1}
              </span>
            </button>
          )
        })}
      </div>

      {picked && (
        <div className="mt-6 space-y-4">
          <Feedback correct={correct}>
            {!correct && (
              <p lang="de">
                Yang benar: <strong>{withArticle(word)}</strong>
              </p>
            )}
            {hint && <p className={hint.exception ? 'text-warn' : ''}>💡 {hint.text}</p>}
            <p lang="de" className="mt-1 text-muted">
              {word.example}
            </p>
          </Feedback>
          <Button size="lg" className="w-full" onClick={advance} autoFocus>
            Lanjut <kbd className="text-xs opacity-70">Enter</kbd>
          </Button>
        </div>
      )}
    </div>
  )
}
