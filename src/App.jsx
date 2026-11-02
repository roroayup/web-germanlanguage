import { Suspense } from 'react'
import { Outlet, ScrollRestoration } from 'react-router-dom'
import { Navbar } from './components/layout/Navbar'
import { BottomNav } from './components/layout/BottomNav'
import { Footer } from './components/layout/Footer'
import { RouteFallback } from './components/layout/RouteFallback'
import { ProgressProvider } from './context/ProgressProvider'

export default function App() {
  return (
    <ProgressProvider>
      <div className="flex min-h-dvh flex-col">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-ink-fg"
        >
          Lewati ke konten
        </a>

        <Navbar />

        <div id="content" className="flex-1">
          {/* Route chunks are fetched on demand; this covers the gap. */}
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </div>

        <Footer />
        <BottomNav />
      </div>

      <ScrollRestoration />
    </ProgressProvider>
  )
}
