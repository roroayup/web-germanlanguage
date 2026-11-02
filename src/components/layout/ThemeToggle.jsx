import { useTheme } from '../../hooks/useTheme'
import { Icon } from '../ui/Icon'

export function ThemeToggle() {
  const { dark, toggle } = useTheme()

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
      className="grid h-10 w-10 place-items-center rounded-xl text-muted transition hover:bg-surface-2 hover:text-text"
    >
      <Icon name={dark ? 'sun' : 'moon'} />
    </button>
  )
}
