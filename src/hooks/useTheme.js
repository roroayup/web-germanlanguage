import { useCallback, useState } from 'react'

const THEME_KEY = 'de-theme'

const isDark = () => document.documentElement.classList.contains('dark')

/**
 * Light/dark toggle. The initial class is set by the inline script in
 * index.html before React loads, so this reads the DOM rather than storage.
 */
export function useTheme() {
  const [dark, setDark] = useState(isDark)

  const toggle = useCallback(() => {
    const next = !isDark()
    document.documentElement.classList.toggle('dark', next)
    try {
      window.localStorage.setItem(THEME_KEY, next ? 'dark' : 'light')
    } catch {
      /* the choice still applies for this visit */
    }
    setDark(next)
  }, [])

  return { dark, toggle }
}
