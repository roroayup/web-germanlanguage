import { ProgressBar } from '../ui/ProgressBar'
import { Icon } from '../ui/Icon'

export function SessionProgress({ index, total, onExit }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <button
        type="button"
        onClick={onExit}
        aria-label="Keluar dari sesi"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-text"
      >
        <Icon name="close" />
      </button>
      <ProgressBar value={index} max={total} label="Progres sesi" className="flex-1" />
      <span className="text-sm font-semibold tabular-nums text-muted">
        {Math.min(index + 1, total)}/{total}
      </span>
    </div>
  )
}
