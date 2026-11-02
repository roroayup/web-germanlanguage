import { createContext } from 'react'

/**
 * Kept in its own module so the provider file exports only a component —
 * Vite's fast refresh bails out on files that mix components with other exports.
 */
export const ProgressContext = createContext(null)
