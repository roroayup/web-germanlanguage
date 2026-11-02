import { useCallback, useEffect, useMemo, useState } from 'react'
import { ProgressContext } from './progressContext'
import {
  clearProgress,
  daysBetween,
  emptyProgress,
  loadProgress,
  normalizeProgress,
  saveProgress,
  todayISO,
} from '../lib/storage'
import { review } from '../lib/srs'

/** Advances the streak once per calendar day; a gap of 2+ days resets it. */
function touchStreak(streak) {
  const today = todayISO()
  if (streak.lastStudied === today) return streak

  const gap = streak.lastStudied ? daysBetween(streak.lastStudied, today) : null
  const current = gap === 1 ? streak.current + 1 : 1

  return { current, longest: Math.max(streak.longest, current), lastStudied: today }
}

/**
 * Single source of truth for study progress. Everything lives in localStorage —
 * no account, no backend — with export/import as the way to move it between
 * devices.
 */
export function ProgressProvider({ children }) {
  const [progress, setProgress] = useState(loadProgress)

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  const recordReview = useCallback((key, wasCorrect) => {
    setProgress((prev) => ({
      ...prev,
      items: { ...prev.items, [key]: review(prev.items[key], wasCorrect) },
      streak: touchStreak(prev.streak),
    }))
  }, [])

  const recordQuiz = useCallback((score, total) => {
    setProgress((prev) => ({
      ...prev,
      // Newest first, capped so localStorage cannot grow without bound.
      quizHistory: [{ date: todayISO(), score, total }, ...prev.quizHistory].slice(0, 20),
      streak: touchStreak(prev.streak),
    }))
  }, [])

  const reset = useCallback(() => {
    clearProgress()
    setProgress(emptyProgress())
  }, [])

  /** Returns false when the data is not a progress backup from this app. */
  const importProgress = useCallback((data) => {
    const next = normalizeProgress(data)
    if (!next) return false
    setProgress(next)
    return true
  }, [])

  const value = useMemo(
    () => ({ progress, items: progress.items, recordReview, recordQuiz, reset, importProgress }),
    [progress, recordReview, recordQuiz, reset, importProgress],
  )

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}
