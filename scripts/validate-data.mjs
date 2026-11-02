import { readFile } from 'node:fs/promises'

/**
 * Guards the content before it can reach a learner.
 *
 * Wrong content is worse than missing content — a learner who memorises the
 * wrong article has to unlearn it later — so this runs as part of
 * `npm run build` and fails the build rather than warning.
 */
const problems = []
const fail = (where, message) => problems.push(`${where}: ${message}`)

const read = async (name) => JSON.parse(await readFile(`src/data/${name}.json`, 'utf8'))

const [topics, vocabulary, verbs, grammar, sentences] = await Promise.all(
  ['topics', 'vocabulary', 'verbs', 'grammar', 'sentences'].map(read),
)

const ARTICLES = ['der', 'die', 'das']
const POS = ['noun', 'name', 'adj', 'adv', 'phrase', 'number', 'question', 'conj', 'prep']
const PRONOUNS = ['ich', 'du', 'er', 'wir', 'ihr', 'sie']
const topicIds = new Set(topics.map((t) => t.id))

const filled = (value) => typeof value === 'string' && value.trim().length > 0

// ── ids unique across every file ────────────────────────────────────────────
const allIds = [...topics, ...vocabulary, ...verbs, ...grammar, ...sentences].map((r) => r.id)
const duplicates = allIds.filter((id, i) => allIds.indexOf(id) !== i)
if (duplicates.length) fail('ids', `duplicated → ${[...new Set(duplicates)].join(', ')}`)

// ── vocabulary ──────────────────────────────────────────────────────────────
for (const row of vocabulary) {
  const where = `vocabulary ${row.id}`
  for (const field of ['de', 'meaning', 'example', 'exampleMeaning']) {
    if (!filled(row[field])) fail(where, `missing ${field}`)
  }
  if (!POS.includes(row.pos)) fail(where, `unknown pos → ${row.pos}`)
  if (!topicIds.has(row.topic)) fail(where, `unknown topic → ${row.topic}`)

  if (row.pos === 'noun') {
    if (!ARTICLES.includes(row.article)) fail(where, `noun needs der/die/das → ${row.article}`)
    // Every German noun is capitalised; a lowercase one is a typo.
    if (!/^\p{Lu}/u.test(row.de)) fail(where, `noun must be capitalised → ${row.de}`)
    if (row.plural !== null && !/^\p{Lu}/u.test(row.plural ?? '')) fail(where, `odd plural → ${row.plural}`)
    if (row.pluralOnly && row.article !== 'die') fail(where, 'plural-only nouns take die')
  } else if (row.pos === 'name' && !/^\p{Lu}/u.test(row.de)) {
    fail(where, `country and language names are capitalised → ${row.de}`)
  } else if (row.article !== null || row.plural !== null) {
    fail(where, 'only nouns carry an article or plural')
  }
}

// ── verbs ───────────────────────────────────────────────────────────────────
for (const verb of verbs) {
  const where = `verbs ${verb.id}`
  if (!filled(verb.inf) || !filled(verb.meaning)) fail(where, 'missing infinitive or meaning')
  if (!['regular', 'irregular', 'mixed', 'modal'].includes(verb.type)) fail(where, `unknown type → ${verb.type}`)
  if (!['haben', 'sein'].includes(verb.aux)) fail(where, `aux must be haben/sein → ${verb.aux}`)
  if (verb.partizip !== null && !filled(verb.partizip)) fail(where, 'empty partizip')

  for (const key of PRONOUNS) {
    const form = verb.present?.[key]
    if (!filled(form)) {
      fail(where, `missing present form for ${key}`)
      continue
    }
    // A separable verb's prefix must appear detached at the end of every form.
    if (verb.separable && !form.endsWith(` ${verb.prefix}`)) fail(where, `${key} form must end with "${verb.prefix}"`)
  }
  if (verb.separable && !verb.inf.startsWith(verb.prefix)) fail(where, `infinitive must start with ${verb.prefix}`)
  if (verb.present?.wir !== verb.present?.sie) fail(where, 'wir and sie forms should match')
}

// ── grammar ─────────────────────────────────────────────────────────────────
for (const topic of grammar) {
  const where = `grammar ${topic.id}`
  if (!filled(topic.title) || !filled(topic.summary)) fail(where, 'missing title or summary')
  if (!topic.sections?.length) fail(where, 'needs at least one section')

  for (const section of topic.sections ?? []) {
    const width = section.table?.head.length
    for (const row of section.table?.rows ?? []) {
      if (row.length !== width) fail(where, `table row width ${row.length} ≠ head ${width} in "${section.heading}"`)
    }
  }

  topic.exercises?.forEach((exercise, i) => {
    if (!filled(exercise.prompt)) fail(`${where} #${i}`, 'missing prompt')
    if (!Array.isArray(exercise.choices) || exercise.choices.length < 2) fail(`${where} #${i}`, 'needs 2+ choices')
    if (new Set(exercise.choices).size !== exercise.choices?.length) fail(`${where} #${i}`, 'duplicate choices')
    if (exercise.choices?.[exercise.answer] === undefined) fail(`${where} #${i}`, 'answer index out of range')
  })
}

// ── sentences ───────────────────────────────────────────────────────────────
for (const row of sentences) {
  if (!filled(row.de) || !filled(row.meaning)) fail(`sentences ${row.id}`, 'missing text')
  if (!topicIds.has(row.topic)) fail(`sentences ${row.id}`, `unknown topic → ${row.topic}`)
}

if (problems.length) {
  console.error(`✗ ${problems.length} data problem(s):\n  ${problems.join('\n  ')}`)
  process.exit(1)
}

console.log(
  `✓ data ok — ${vocabulary.length} words, ${verbs.length} verbs, ${grammar.length} grammar topics, ${sentences.length} sentences`,
)
