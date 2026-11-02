import { ArticleTag } from '../../ui/ArticleTag'
import { SpeakButton } from '../SpeakButton'
import { GENDERS, POS_LABELS, VERB_TYPES, perfektForm, pluralLabel, withArticle } from '../../../lib/german'

function Front({ card, speech }) {
  const isVerb = card.kind === 'verb'
  const gender = GENDERS[card.item.article]
  const spoken = isVerb ? card.item.inf : withArticle(card.item)

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
        {isVerb ? `kata kerja · ${VERB_TYPES[card.item.type]}` : POS_LABELS[card.item.pos]}
      </p>
      <p lang="de" className="font-display text-4xl font-bold sm:text-5xl">
        {card.item.article && <span className={`${gender.text} mr-2`}>{card.item.article}</span>}
        {isVerb ? card.item.inf : card.item.de}
      </p>
      <SpeakButton speech={speech} text={spoken} />
      <p className="mt-2 text-sm text-muted">Ketuk kartu atau tekan Spasi untuk membalik</p>
    </div>
  )
}

function Back({ card, speech }) {
  const { item } = card
  const isVerb = card.kind === 'verb'
  const plural = isVerb ? null : pluralLabel(item)

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-6">
      <div className="text-center">
        <p className="text-2xl font-bold">{item.meaning}</p>
        <p lang="de" className="mt-1 text-muted">
          {item.article && <ArticleTag article={item.article} className="mr-1.5 align-middle" />}
          {isVerb ? item.inf : item.de}
          {plural && <span> · {plural}</span>}
        </p>
      </div>

      {isVerb && (
        <dl lang="de" className="grid grid-cols-3 gap-2 text-center text-sm">
          {[
            ['ich', item.present.ich],
            ['du', item.present.du],
            ['er/sie/es', item.present.er],
          ].map(([pronoun, form]) => (
            <div key={pronoun} className="rounded-lg bg-surface-2 px-2 py-2">
              <dt className="text-xs text-muted">{pronoun}</dt>
              <dd className="font-semibold">{form}</dd>
            </div>
          ))}
          {item.partizip && (
            <div className="col-span-3 rounded-lg bg-surface-2 px-2 py-2">
              <dt className="text-xs text-muted">Perfekt</dt>
              <dd className="font-semibold">er {perfektForm(item, 'er')}</dd>
            </div>
          )}
        </dl>
      )}

      <div className="mt-auto rounded-xl bg-surface-2 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p lang="de" className="font-medium">
              {item.example}
            </p>
            <p className="mt-1 text-sm text-muted">{item.exampleMeaning}</p>
          </div>
          <SpeakButton speech={speech} text={item.example} size="sm" label="Dengarkan contoh" />
        </div>
      </div>
    </div>
  )
}

/** A 3D flip card. The whole card is the flip button; inner buttons stop propagation. */
export function FlashCard({ card, flipped, onFlip, speech }) {
  return (
    <div className="[perspective:1200px]">
      <div
        role="button"
        tabIndex={0}
        aria-label={flipped ? 'Tampilkan sisi depan' : 'Tampilkan arti'}
        onClick={onFlip}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return
          if (event.key === 'Enter') {
            event.preventDefault()
            onFlip()
          }
        }}
        className={`preserve-3d relative h-[26rem] cursor-pointer transition-transform duration-500 ${
          flipped ? 'rotate-y-180' : ''
        }`}
      >
        <div className="backface-hidden absolute inset-0 rounded-card border border-line bg-surface shadow-lift">
          <Front card={card} speech={speech} />
        </div>
        <div className="backface-hidden rotate-y-180 absolute inset-0 rounded-card border border-line bg-surface shadow-lift">
          <Back card={card} speech={speech} />
        </div>
      </div>
    </div>
  )
}
