import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { NAV_ITEMS } from './navItems'
import { ThemeToggle } from './ThemeToggle'
import { Icon } from '../ui/Icon'
import { SITE } from '../../lib/site'

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-semibold transition ${
    isActive ? 'bg-surface-2 text-text' : 'text-muted hover:text-text'
  }`

export function Navbar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  // Navigating closes the mobile menu. Adjusting state during render on a
  // changed value is React's recommended alternative to an effect here.
  const [lastPath, setLastPath] = useState(pathname)
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (event) => event.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-2.5 font-display text-lg font-bold">
          <span aria-hidden="true" className="flex h-6 w-6 flex-col overflow-hidden rounded-md">
            <span className="flex-1 bg-flag-black" />
            <span className="flex-1 bg-flag-red" />
            <span className="flex-1 bg-accent" />
          </span>
          {SITE.name}
        </Link>

        <nav aria-label="Navigasi utama" className="ml-auto hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.slice(1).map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {item.de}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 lg:ml-2">
          <ThemeToggle />
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-xl text-muted hover:bg-surface-2 hover:text-text lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Tutup menu' : 'Buka menu'}
            onClick={() => setOpen((value) => !value)}
          >
            <Icon name={open ? 'close' : 'menu'} />
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label="Menu" className="border-t border-line bg-bg px-4 py-3 lg:hidden">
          <ul className="grid grid-cols-2 gap-2">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl border px-3 py-3 text-sm ${
                      isActive ? 'border-accent bg-accent-soft' : 'border-line bg-surface'
                    }`
                  }
                >
                  <Icon name={item.icon} className="h-5 w-5 shrink-0 text-muted" />
                  <span>
                    <span className="block font-semibold">{item.de}</span>
                    <span className="block text-xs text-muted">{item.label}</span>
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <div aria-hidden="true" className="flag-rule h-0.5 opacity-80" />
    </header>
  )
}
