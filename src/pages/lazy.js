import { lazy } from 'react'

/**
 * Lazily loaded route components, kept apart from the router so each file
 * exports one kind of thing — fast refresh needs that separation.
 *
 * Home is deliberately absent: it is the landing page and ships eagerly.
 */
export const Flashcards = lazy(() => import('./Flashcards'))
export const Articles = lazy(() => import('./Articles'))
export const Conjugation = lazy(() => import('./Conjugation'))
export const Grammar = lazy(() => import('./Grammar'))
export const Listening = lazy(() => import('./Listening'))
export const Quiz = lazy(() => import('./Quiz'))
export const Progress = lazy(() => import('./Progress'))
export const NotFound = lazy(() => import('./NotFound'))
