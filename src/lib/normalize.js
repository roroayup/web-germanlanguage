/**
 * Answer checking for typed German.
 *
 * Learners on a phone or a non-German keyboard often cannot type ä ö ü ß, so
 * the conventional transliterations (ae, oe, ue, ss) are accepted. Case and
 * trailing punctuation are forgiven too. Anything forgiven is reported back so
 * the UI can show the exact spelling — accepted is not the same as correct.
 */

const FOLD = [
  [/ä/g, 'ae'],
  [/ö/g, 'oe'],
  [/ü/g, 'ue'],
  [/ß/g, 'ss'],
]

/** Collapses whitespace and strips punctuation that never changes meaning. */
export function tidy(text) {
  return text
    .replace(/[.,!?;:„“"«»]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Lowercase, punctuation-free, umlaut-free form used for comparison. */
export function fold(text) {
  return FOLD.reduce((value, [pattern, replacement]) => value.replace(pattern, replacement), tidy(text).toLowerCase())
}

/**
 * @returns {{ correct: boolean, exact: boolean, note: string | null }}
 * `exact` is true only when the spelling matches including umlauts and case.
 */
export function checkAnswer(input, expected) {
  const accepted = Array.isArray(expected) ? expected : [expected]
  const typed = tidy(input)

  if (!typed) return { correct: false, exact: false, note: null }

  for (const candidate of accepted) {
    const target = tidy(candidate)
    if (typed === target) return { correct: true, exact: true, note: null }

    if (fold(typed) === fold(target)) {
      const caseOnly = typed.toLowerCase() === target.toLowerCase()
      return {
        correct: true,
        exact: false,
        note: caseOnly
          ? `Perhatikan huruf kapital: ${candidate}`
          : `Diterima — ejaan yang benar: ${candidate}`,
      }
    }
  }

  return { correct: false, exact: false, note: null }
}

export const UMLAUTS = ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü']
