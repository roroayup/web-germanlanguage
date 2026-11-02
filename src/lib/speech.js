/**
 * Thin wrapper over the Web Speech API.
 *
 * Two quirks drive this design:
 *  1. `getVoices()` is empty on first call in Chrome — the list arrives later
 *     via `voiceschanged`, so callers subscribe instead of polling.
 *  2. Whether a German voice exists at all depends on the user's OS. We detect
 *     that up front so the UI can show a transcript instead of a play button
 *     that silently does nothing.
 */

export const isSpeechSupported = () =>
  typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window

const isGerman = (voice) => voice.lang === 'de-DE' || voice.lang.toLowerCase().startsWith('de')

/** de-DE first, then other German locales (de-AT, de-CH) as a fallback. */
export function getGermanVoices() {
  if (!isSpeechSupported()) return []
  return window.speechSynthesis
    .getVoices()
    .filter(isGerman)
    .sort((a, b) => Number(b.lang === 'de-DE') - Number(a.lang === 'de-DE'))
}

export function subscribeToVoices(onVoices) {
  if (!isSpeechSupported()) {
    onVoices([])
    return () => {}
  }

  const emit = () => onVoices(getGermanVoices())

  emit() // may already be populated (Safari, Firefox)
  window.speechSynthesis.addEventListener('voiceschanged', emit)

  return () => window.speechSynthesis.removeEventListener('voiceschanged', emit)
}

export function cancelSpeech() {
  if (isSpeechSupported()) window.speechSynthesis.cancel()
}

/**
 * Speaks German text. Resolves when playback finishes, rejects if the platform
 * cannot speak it. Any in-flight utterance is cancelled first so rapid taps do
 * not queue up and play over each other.
 */
export function speak(text, { rate = 0.9, voice = null, onStart, onEnd } = {}) {
  return new Promise((resolve, reject) => {
    if (!isSpeechSupported()) {
      reject(new Error('speech-unsupported'))
      return
    }

    window.speechSynthesis.cancel()

    const utterance = new window.SpeechSynthesisUtterance(text)
    utterance.lang = 'de-DE'
    utterance.rate = rate
    utterance.pitch = 1

    if (voice) utterance.voice = voice

    const finish = () => {
      onEnd?.()
      resolve()
    }

    utterance.onstart = () => onStart?.()
    utterance.onend = finish
    utterance.onerror = (event) => {
      onEnd?.()
      // Cancelling on purpose fires an error too; that is not a failure.
      if (event.error === 'interrupted' || event.error === 'canceled') resolve()
      else reject(new Error(event.error || 'speech-failed'))
    }

    window.speechSynthesis.speak(utterance)
  })
}

export const SPEED_OPTIONS = [
  { label: 'Lambat', value: 0.65 },
  { label: 'Normal', value: 0.9 },
]
