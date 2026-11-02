/** Fisher–Yates on a copy — the input array is never mutated. */
export function shuffle(array, rand = Math.random) {
  const out = [...array]

  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }

  return out
}

export const sample = (array, count, rand = Math.random) => shuffle(array, rand).slice(0, count)

/**
 * Picks `count - 1` wrong answers plus the right one and shuffles them.
 * Returns the choices and where the correct one landed.
 */
export function buildChoices(correct, pool, count = 4, rand = Math.random) {
  const distractors = sample(
    pool.filter((candidate) => candidate !== correct),
    count - 1,
    rand,
  )
  const choices = shuffle([correct, ...distractors], rand)

  return { choices, answer: choices.indexOf(correct) }
}
