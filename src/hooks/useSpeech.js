import { useCallback, useEffect, useRef, useState } from 'react'
import { cancelSpeech, isSpeechSupported, speak, subscribeToVoices } from '../lib/speech'

/**
 * German text-to-speech plus what the UI needs to degrade gracefully: whether
 * a German voice exists, and whether audio is playing right now.
 */
export function useSpeech() {
  const [voices, setVoices] = useState([])
  const [ready, setReady] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    const unsubscribe = subscribeToVoices((found) => {
      if (!mounted.current) return
      setVoices(found)
      if (found.length) setReady(true)
    })

    // Firefox may never fire `voiceschanged`; settle after a beat regardless.
    const timer = setTimeout(() => mounted.current && setReady(true), 1200)

    return () => {
      mounted.current = false
      clearTimeout(timer)
      unsubscribe()
      cancelSpeech()
    }
  }, [])

  const play = useCallback(
    async (text, rate = 0.9) => {
      if (!isSpeechSupported()) return false

      try {
        await speak(text, {
          rate,
          voice: voices[0] ?? null,
          onStart: () => mounted.current && setSpeaking(true),
          onEnd: () => mounted.current && setSpeaking(false),
        })
        return true
      } catch {
        if (mounted.current) setSpeaking(false)
        return false
      }
    },
    [voices],
  )

  const stop = useCallback(() => {
    cancelSpeech()
    setSpeaking(false)
  }, [])

  return {
    play,
    stop,
    speaking,
    supported: isSpeechSupported(),
    /** False once `ready` is true means: no German voice on this device. */
    hasGermanVoice: voices.length > 0,
    ready,
  }
}
