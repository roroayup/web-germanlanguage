const STORAGE_KEY = 'de-a1-progress-v1'
const VERSION = 1

export const emptyProgress = () => ({
  version: VERSION,
  items: {},
  streak: { current: 0, longest: 0, lastStudied: null },
  quizHistory: [],
})

/**
 * localStorage throws in private-browsing Safari and when quota is full. Every
 * access is guarded and falls back to a fresh in-memory progress object, so the
 * app keeps working for the session instead of white-screening.
 */
export function loadProgress() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyProgress()
    return normalizeProgress(JSON.parse(raw)) ?? emptyProgress()
  } catch {
    return emptyProgress()
  }
}

export function saveProgress(progress) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    return true
  } catch {
    return false
  }
}

export function clearProgress() {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* nothing to clean up if storage is unavailable */
  }
}

/**
 * Returns a well-formed progress object, or null when `data` is not one.
 * Shared by load and import, so a hand-edited backup file goes through the
 * same checks as what the app wrote itself.
 */
export function normalizeProgress(data) {
  if (!data || typeof data !== 'object' || data.version !== VERSION) return null
  if (typeof data.items !== 'object' || data.items === null) return null

  const base = emptyProgress()
  return {
    ...base,
    ...data,
    streak: { ...base.streak, ...data.streak },
    quizHistory: Array.isArray(data.quizHistory) ? data.quizHistory : [],
  }
}

export function exportFileName() {
  return `deutsch-a1-progress-${todayISO()}.json`
}

export const todayISO = () => {
  const now = new Date()
  // Local calendar day, not UTC — a streak should roll over at the learner's midnight.
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

/** Days between two YYYY-MM-DD strings, ignoring time of day. */
export function daysBetween(fromISO, toISO) {
  const ms = Date.parse(`${toISO}T00:00:00`) - Date.parse(`${fromISO}T00:00:00`)
  return Math.round(ms / 86_400_000)
}
