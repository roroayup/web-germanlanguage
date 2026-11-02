import { buildChoices, sample, shuffle } from './shuffle'
import { KEY, PRONOUNS, isArticleDrillable, withArticle } from './german'

/**
 * Builds mixed multiple-choice questions from the content files.
 *
 * Every question has the same shape so the quiz page never branches on kind:
 *   { id, kind, label, prompt, hint?, choices, answer, explain?, progressKey, speak? }
 * `speak` is German text the UI may offer to read aloud.
 */

export const QUIZ_KINDS = [
  { id: 'meaning', label: 'Arti kata' },
  { id: 'reverse', label: 'Terjemahkan ke bahasa Jerman' },
  { id: 'artikel', label: 'der / die / das' },
  { id: 'konj', label: 'Konjugasi' },
  { id: 'grammar', label: 'Tata bahasa' },
]

const distinct = (values) => [...new Set(values)]

function meaningQuestion(word, vocabulary, rand) {
  const pool = distinct(vocabulary.filter((w) => w.pos === word.pos).map((w) => w.meaning))
  const { choices, answer } = buildChoices(word.meaning, pool, 4, rand)
  return {
    id: `meaning-${word.id}`,
    kind: 'meaning',
    label: 'Apa artinya?',
    prompt: withArticle(word),
    choices,
    answer,
    explain: word.example,
    progressKey: KEY.card(word.id),
    speak: withArticle(word),
  }
}

function reverseQuestion(word, vocabulary, rand) {
  const pool = distinct(vocabulary.filter((w) => w.pos === word.pos).map(withArticle))
  const { choices, answer } = buildChoices(withArticle(word), pool, 4, rand)
  return {
    id: `reverse-${word.id}`,
    kind: 'reverse',
    label: 'Bahasa Jermannya?',
    prompt: word.meaning,
    choices,
    answer,
    explain: `${withArticle(word)} — ${word.example}`,
    progressKey: KEY.card(word.id),
  }
}

function articleQuestion(word) {
  const choices = ['der', 'die', 'das']
  return {
    id: `artikel-${word.id}`,
    kind: 'artikel',
    label: 'Artikel yang benar?',
    prompt: word.de,
    hint: word.meaning,
    choices,
    answer: choices.indexOf(word.article),
    explain: withArticle(word),
    progressKey: KEY.artikel(word.id),
  }
}

function conjugationQuestion(verb, rand) {
  const pronoun = sample(PRONOUNS, 1, rand)[0]
  const correct = verb.present[pronoun.key]
  // Distractors are the verb's other forms — the realistic mistakes.
  const pool = distinct(Object.values(verb.present))
  const { choices, answer } = buildChoices(correct, pool, Math.min(4, pool.length), rand)
  return {
    id: `konj-${verb.id}-${pronoun.key}`,
    kind: 'konj',
    label: `Präsens: ${verb.inf} (${verb.meaning})`,
    prompt: `${pronoun.label} ___`,
    choices,
    answer,
    explain: `${pronoun.label} ${correct}`,
    progressKey: KEY.konj(verb.id),
  }
}

function grammarQuestion({ topic, exercise, index }, rand) {
  const correct = exercise.choices[exercise.answer]
  const choices = shuffle(exercise.choices, rand)
  return {
    id: `grammar-${topic.id}-${index}`,
    kind: 'grammar',
    label: topic.title,
    prompt: exercise.prompt,
    choices,
    answer: choices.indexOf(correct),
    explain: exercise.explain,
    progressKey: KEY.grammatik(`${topic.id}-${index}`),
  }
}

/**
 * @param {object} content  { vocabulary, verbs, grammar }
 * @param {object} options  { count, kinds, topic } — topic filters vocabulary
 */
export function buildQuiz(content, { count = 10, kinds = QUIZ_KINDS.map((k) => k.id), topic = null } = {}, rand = Math.random) {
  const words = topic ? content.vocabulary.filter((w) => w.topic === topic) : content.vocabulary
  const nouns = words.filter(isArticleDrillable)
  const exercises = content.grammar.flatMap((t) =>
    (t.exercises ?? []).map((exercise, index) => ({ topic: t, exercise, index })),
  )

  const makers = {
    meaning: () => sample(words, 1, rand).map((w) => meaningQuestion(w, content.vocabulary, rand))[0],
    reverse: () => sample(words, 1, rand).map((w) => reverseQuestion(w, content.vocabulary, rand))[0],
    artikel: () => nouns.length && articleQuestion(sample(nouns, 1, rand)[0]),
    konj: () => conjugationQuestion(sample(content.verbs, 1, rand)[0], rand),
    grammar: () => grammarQuestion(sample(exercises, 1, rand)[0], rand),
  }

  const active = kinds.filter((kind) => makers[kind])
  if (!active.length || !words.length) return []

  const questions = []
  const seen = new Set()
  let attempts = 0

  // Round-robin across kinds so a 10-question quiz is genuinely mixed; the
  // attempt cap stops small pools (one topic, few nouns) from looping forever.
  while (questions.length < count && attempts < count * 20) {
    const kind = active[attempts % active.length]
    attempts += 1
    const question = makers[kind]()
    if (!question || seen.has(question.id)) continue
    seen.add(question.id)
    questions.push(question)
  }

  return shuffle(questions, rand)
}
