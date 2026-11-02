import { useCallback, useState } from 'react'

/**
 * Walks through a fixed list of study items, one at a time, remembering what
 * was answered right and wrong. Restart by remounting with a new `key`.
 */
export function useSession(items) {
  const [index, setIndex] = useState(0)
  const [results, setResults] = useState([])

  const current = items[index] ?? null

  const record = useCallback(
    (correct) => setResults((prev) => [...prev, { item: items[index], correct }]),
    [items, index],
  )
  const next = useCallback(() => setIndex((value) => value + 1), [])

  return {
    index,
    current,
    total: items.length,
    done: index >= items.length,
    results,
    record,
    next,
  }
}
