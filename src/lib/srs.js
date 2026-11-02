/**
 * Leitner box scheduling, five levels.
 *
 * Box 1 = brand new or just missed, box 5 = solid. A correct answer promotes
 * one box, a miss drops straight back to box 1 — the reason a card you keep
 * failing keeps coming back.
 *
 * Progress keys are namespaced by study mode (`card:`, `artikel:`, `konj:` …)
 * so knowing a word's meaning and knowing its article are tracked separately.
 */
export const MAX_BOX = 5
export const MASTERED_BOX = 4

export const newItemState = () => ({ box: 1, seen: 0, correct: 0 })

export function review(state, wasCorrect) {
  const current = state ?? newItemState()

  return {
    box: wasCorrect ? Math.min(current.box + 1, MAX_BOX) : 1,
    seen: current.seen + 1,
    correct: current.correct + (wasCorrect ? 1 : 0),
  }
}

export const isMastered = (state) => (state?.box ?? 1) >= MASTERED_BOX

/** Lower boxes get more weight, so struggling items surface first. */
export const weightOf = (state) => MAX_BOX + 1 - (state?.box ?? 1)

/**
 * Orders a deck for study: weakest first, unseen ahead of mastered, with
 * `rand` breaking ties so sessions never repeat the same sequence.
 * `keyOf` maps an item to its progress key.
 */
export function buildSession(items, progressItems, size, keyOf, rand = Math.random) {
  const scored = items.map((item) => ({
    item,
    score: weightOf(progressItems[keyOf(item)]) + rand() * 2,
  }))

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, size).map((entry) => entry.item)
}

/** Counts mastered keys, optionally only those with a given prefix. */
export function countMastered(progressItems, prefix = '') {
  return Object.entries(progressItems).filter(
    ([key, state]) => key.startsWith(prefix) && isMastered(state),
  ).length
}

export function summarize(items, progressItems, keyOf) {
  let mastered = 0
  let learning = 0

  for (const item of items) {
    const state = progressItems[keyOf(item)]
    if (!state) continue
    if (isMastered(state)) mastered += 1
    else learning += 1
  }

  return { mastered, learning, untouched: items.length - mastered - learning, total: items.length }
}

/** Keys missed most often, worst first — feeds the "sering salah" list. */
export function mostMissed(progressItems, limit = 10) {
  return Object.entries(progressItems)
    .map(([key, state]) => ({ key, misses: state.seen - state.correct, state }))
    .filter((entry) => entry.misses > 0)
    .sort((a, b) => b.misses - a.misses || a.state.box - b.state.box)
    .slice(0, limit)
}
