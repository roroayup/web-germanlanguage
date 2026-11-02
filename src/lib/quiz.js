import { buildChoices, sample, shuffle } from './shuffle'
import { KEY, PRONOUNS, auxForm, isArticleDrillable, withArticle } from './german'

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
  { id: 'plural', label: 'Bentuk jamak' },
  { id: 'konj', label: 'Konjugasi' },
  { id: 'perfekt', label: 'Perfekt' },
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

/** Umlauts the last a / o / u / au — the vowel German plurals change. */
const umlaut = (word) => word.replace(/(au|a|o|u)(?!.*(au|a|o|u))/i, (v) => ({ au: 'äu', a: 'ä', o: 'ö', u: 'ü', Au: 'Äu', A: 'Ä', O: 'Ö', U: 'Ü' })[v] ?? v)

/**
 * Forms that look wrong to the generator but are real words: a second valid
 * plural (Worte, Bänke = benches) or an unrelated noun (Busen). Never offered.
 */
const REAL_WORDS = {
  Wort: ['Worte'],
  Bank: ['Bänke', 'Banker'],
  Bus: ['Busen'],
  Mutter: ['Muttern'],
  Glas: ['Glaser'],
}

/**
 * Wrong plurals that follow a real German pattern for the noun's ending, so a
 * distractor is never obviously impossible (no "Compüterer").
 */
function pluralDistractors(word) {
  const base = word.de
  const sibilant = /[sßzx]$/.test(base)
  let forms
  if (base.endsWith('e')) {
    forms = [`${base}n`, `${base}s`, base, umlaut(base), `${base.slice(0, -1)}er`]
  } else if (/(er|el|en|chen|lein)$/.test(base)) {
    forms = [base, umlaut(base), `${base}n`, `${base}s`, `${base}e`]
  } else if (/[aiouy]$/.test(base)) {
    // Auto, Hobby, Kino: umlauting a final-vowel loanword never looks German.
    forms = [`${base}s`, `${base}n`, `${base}en`, `${base}e`, base]
  } else {
    forms = [`${base}e`, `${umlaut(base)}e`, `${base}en`, `${base}er`, `${umlaut(base)}er`]
    forms.push(sibilant ? `${base}se` : `${base}s`, base)
  }
  const exclude = new Set([word.plural, ...(REAL_WORDS[base] ?? [])])
  return distinct(forms).filter((form) => !exclude.has(form))
}

function pluralQuestion(word, rand) {
  const correct = `die ${word.plural}`
  const wrong = sample(pluralDistractors(word), 3, rand).map((form) => `die ${form}`)
  const choices = shuffle([correct, ...wrong], rand)
  return {
    id: `plural-${word.id}`,
    kind: 'plural',
    label: 'Bentuk jamaknya?',
    prompt: withArticle(word),
    hint: word.meaning,
    choices,
    answer: choices.indexOf(correct),
    explain: `${withArticle(word)} → ${correct}`,
    progressKey: KEY.plural(word.id),
  }
}

/**
 * The classic learner error for each verb: ge- added where it does not belong
 * (gestudiert, gebesucht), or the regular/irregular ending swapped
 * (gefahrt, gemachen).
 */
function wrongPartizip(verb) {
  const correct = verb.partizip
  if (!correct.startsWith('ge')) return `ge${correct}`
  const stem = verb.inf.replace(/e?n$/, '')
  const swapped = verb.type === 'regular' ? `ge${stem}en` : `ge${stem}t`
  return swapped === correct ? `ge${stem}en` : swapped
}

function perfektQuestion(verb, rand) {
  const pronoun = sample(PRONOUNS, 1, rand)[0]
  const otherAux = verb.aux === 'haben' ? 'sein' : 'haben'
  const wrong = wrongPartizip(verb)
  const correct = `${auxForm(verb.aux, pronoun.key)} ${verb.partizip}`
  const choices = shuffle(
    distinct([
      correct,
      `${auxForm(otherAux, pronoun.key)} ${verb.partizip}`,
      `${auxForm(verb.aux, pronoun.key)} ${wrong}`,
      `${auxForm(otherAux, pronoun.key)} ${wrong}`,
    ]),
    rand,
  )
  return {
    id: `perfekt-${verb.id}-${pronoun.key}`,
    kind: 'perfekt',
    label: `Perfekt: ${verb.inf} (${verb.meaning})`,
    prompt: `${pronoun.label} ___`,
    choices,
    answer: choices.indexOf(correct),
    explain: `${pronoun.label} ${correct} — ${verb.aux === 'sein' ? 'perpindahan / perubahan keadaan → sein' : 'kebanyakan kata kerja → haben'}`,
    progressKey: KEY.konj(verb.id),
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
 * @param {object} options  { count, kinds, topic, grammarTopic } — topic filters
 *                          vocabulary, grammarTopic filters grammar exercises
 */
export function buildQuiz(
  content,
  { count = 10, kinds = QUIZ_KINDS.map((k) => k.id), topic = null, grammarTopic = null } = {},
  rand = Math.random,
) {
  const words = topic ? content.vocabulary.filter((w) => w.topic === topic) : content.vocabulary
  const nouns = words.filter(isArticleDrillable)
  const pluralNouns = nouns.filter((w) => w.plural)
  // Separable verbs would need prefix-aware distractors; they are drilled on the Konjugation page.
  const perfektVerbs = content.verbs.filter((v) => v.partizip && !v.separable)
  const grammarTopics = grammarTopic ? content.grammar.filter((t) => t.id === grammarTopic) : content.grammar
  const exercises = grammarTopics.flatMap((t) =>
    (t.exercises ?? []).map((exercise, index) => ({ topic: t, exercise, index })),
  )

  const makers = {
    meaning: () => sample(words, 1, rand).map((w) => meaningQuestion(w, content.vocabulary, rand))[0],
    reverse: () => sample(words, 1, rand).map((w) => reverseQuestion(w, content.vocabulary, rand))[0],
    artikel: () => nouns.length && articleQuestion(sample(nouns, 1, rand)[0]),
    plural: () => pluralNouns.length && pluralQuestion(sample(pluralNouns, 1, rand)[0], rand),
    konj: () => conjugationQuestion(sample(content.verbs, 1, rand)[0], rand),
    perfekt: () => perfektQuestion(sample(perfektVerbs, 1, rand)[0], rand),
    grammar: () => exercises.length && grammarQuestion(sample(exercises, 1, rand)[0], rand),
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
