/**
 * German-specific knowledge the UI needs: pronouns, auxiliaries, gender
 * colours, article hints, and the progress-key namespaces. Plain data and
 * functions — nothing here imports React.
 */

export const PRONOUNS = [
  { key: 'ich', label: 'ich' },
  { key: 'du', label: 'du' },
  { key: 'er', label: 'er / sie / es' },
  { key: 'wir', label: 'wir' },
  { key: 'ihr', label: 'ihr' },
  { key: 'sie', label: 'sie / Sie' },
]

const AUX = {
  haben: { ich: 'habe', du: 'hast', er: 'hat', wir: 'haben', ihr: 'habt', sie: 'haben' },
  sein: { ich: 'bin', du: 'bist', er: 'ist', wir: 'sind', ihr: 'seid', sie: 'sind' },
}

export const TENSES = [
  { id: 'praesens', label: 'Präsens', note: 'sekarang' },
  { id: 'perfekt', label: 'Perfekt', note: 'lampau' },
]

export const auxForm = (aux, pronoun) => AUX[aux][pronoun]

/** "habe gemacht" — or null for verbs whose Perfekt is not used (möchten). */
export function perfektForm(verb, pronoun) {
  if (!verb.partizip) return null
  return `${AUX[verb.aux][pronoun]} ${verb.partizip}`
}

export function conjugate(verb, pronoun, tense) {
  return tense === 'perfekt' ? perfektForm(verb, pronoun) : verb.present[pronoun]
}

export const VERB_TYPES = {
  regular: 'beraturan',
  irregular: 'tidak beraturan',
  mixed: 'campuran',
  modal: 'modal',
}

/**
 * Class names are spelled out in full so Tailwind's scanner can see them —
 * building them with string templates would silently drop the styles.
 */
export const GENDERS = {
  der: { label: 'maskulin', text: 'text-der', bg: 'bg-der', soft: 'bg-der-soft', border: 'border-der', hover: 'hover:border-der' },
  die: { label: 'feminin', text: 'text-die', bg: 'bg-die', soft: 'bg-die-soft', border: 'border-die', hover: 'hover:border-die' },
  das: { label: 'netral', text: 'text-das', bg: 'bg-das', soft: 'bg-das-soft', border: 'border-das', hover: 'hover:border-das' },
}

export const POS_LABELS = {
  noun: 'kata benda',
  name: 'nama negara / bahasa',
  adj: 'kata sifat',
  adv: 'kata keterangan',
  phrase: 'ungkapan',
  number: 'angka',
  question: 'kata tanya',
  conj: 'kata sambung',
  prep: 'kata depan',
}

export const withArticle = (word) => (word.article ? `${word.article} ${word.de}` : word.de)

export function pluralLabel(word) {
  if (word.pos !== 'noun') return null
  if (word.pluralOnly) return 'hanya bentuk jamak'
  return word.plural ? `die ${word.plural}` : 'tanpa bentuk jamak'
}

/** Nouns that can be drilled for their article (plural-only ones cannot). */
export const isArticleDrillable = (word) => word.pos === 'noun' && !word.pluralOnly

/**
 * Ending rules, strongest first. `always` rules are reliable enough to state
 * as fact; the others are tendencies, and the UI words them that way and
 * calls out exceptions instead of pretending the rule held.
 */
const SUFFIX_RULES = [
  { suffix: 'chen', article: 'das', always: true },
  { suffix: 'lein', article: 'das', always: true },
  { suffix: 'ung', article: 'die', always: true },
  { suffix: 'heit', article: 'die', always: true },
  { suffix: 'keit', article: 'die', always: true },
  { suffix: 'schaft', article: 'die', always: true },
  { suffix: 'tät', article: 'die', always: true },
  { suffix: 'ion', article: 'die', always: true },
  { suffix: 'ling', article: 'der', always: true },
  { suffix: 'ismus', article: 'der', always: true },
  { suffix: 'um', article: 'das', always: false },
  { suffix: 'in', article: 'die', always: true, femaleOnly: true },
  { suffix: 'e', article: 'die', always: false },
]

const SEASONS = new Set(['Frühling', 'Sommer', 'Herbst', 'Winter'])
const DAYS_AND_MONTHS = new Set([
  'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag',
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September',
  'Oktober', 'November', 'Dezember',
])

/**
 * @returns {{ text: string, exception: boolean } | null}
 */
export function articleHint(word) {
  if (SEASONS.has(word.de)) return { text: 'Nama musim selalu der.', exception: false }
  if (DAYS_AND_MONTHS.has(word.de)) return { text: 'Nama hari dan bulan selalu der.', exception: false }

  const lower = word.de.toLowerCase()
  const rule = SUFFIX_RULES.find((candidate) => {
    if (!lower.endsWith(candidate.suffix)) return false
    // "-in" only marks female persons (Lehrerin); Wein or Benzin are not.
    if (candidate.femaleOnly) return word.meaning.includes('perempuan')
    // The "-e" tendency is about a final schwa; Kaffee and Tee end in a long -ee.
    if (candidate.suffix === 'e') return !lower.endsWith('ee')
    return true
  })
  if (!rule) return null

  const holds = rule.article === word.article
  const strength = rule.always ? 'selalu' : 'biasanya'

  if (holds) return { text: `Kata berakhiran -${rule.suffix} ${strength} ${rule.article}.`, exception: false }
  return {
    text: `Kata berakhiran -${rule.suffix} biasanya ${rule.article} — ${word.de} adalah pengecualian.`,
    exception: true,
  }
}

/** Progress keys, namespaced per study mode. */
export const KEY = {
  card: (id) => `card:${id}`,
  artikel: (id) => `artikel:${id}`,
  konj: (id) => `konj:${id}`,
  hoeren: (id) => `hoeren:${id}`,
  grammatik: (id) => `grammatik:${id}`,
  plural: (id) => `plural:${id}`,
}
