import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import Home from './pages/Home'
import {
  Articles,
  Conjugation,
  Flashcards,
  Grammar,
  Listening,
  NotFound,
  Progress,
  Quiz,
} from './pages/lazy'

/**
 * Home ships in the initial bundle because it is the landing page. Every study
 * mode is code-split, so the JSON it imports rides along in its own chunk
 * instead of the entry bundle.
 *
 * Paths are German on purpose: they match the page titles the learner sees.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'vokabeln', element: <Flashcards /> },
      { path: 'artikel', element: <Articles /> },
      { path: 'konjugation', element: <Conjugation /> },
      { path: 'grammatik', element: <Grammar /> },
      { path: 'grammatik/:topicId', element: <Grammar /> },
      { path: 'hoeren', element: <Listening /> },
      { path: 'quiz', element: <Quiz /> },
      { path: 'fortschritt', element: <Progress /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])
