import { Link } from 'react-router-dom'

const VARIANTS = {
  primary: 'bg-ink text-ink-fg hover:opacity-90 shadow-soft',
  accent: 'bg-accent text-[#1c1b1f] hover:brightness-95 shadow-soft',
  secondary: 'bg-surface text-text border border-line hover:bg-surface-2',
  ghost: 'text-text hover:bg-surface-2',
}

const SIZES = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
}

/** Renders a router Link when `to` is given, otherwise a native button. */
export function Button({ variant = 'primary', size = 'md', to, className = '', children, ...props }) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition disabled:pointer-events-none disabled:opacity-40 ${VARIANTS[variant]} ${SIZES[size]} ${className}`

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  )
}
