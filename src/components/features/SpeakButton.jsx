import { Icon } from '../ui/Icon'

/**
 * Plays German text through the shared `speech` object from useSpeech().
 * Renders nothing on devices with no German voice — the text is always shown
 * alongside, so there is never a button that silently does nothing.
 */
export function SpeakButton({ speech, text, rate, label = 'Dengarkan', size = 'md', className = '' }) {
  if (!speech.supported || (speech.ready && !speech.hasGermanVoice)) return null

  const dimension = size === 'lg' ? 'h-14 w-14' : size === 'sm' ? 'h-8 w-8' : 'h-10 w-10'

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation()
        speech.play(text, rate)
      }}
      aria-label={`${label}: ${text}`}
      title={label}
      className={`grid shrink-0 place-items-center rounded-full border border-line bg-surface text-text transition hover:bg-surface-2 ${dimension} ${
        speech.speaking ? 'animate-pulse-ring' : ''
      } ${className}`}
    >
      <Icon name="speaker" className={size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} />
    </button>
  )
}
